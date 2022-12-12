import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat'
import { useNavigation } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

import Auction from './Auction';
import ProfileAuction from './ProfileAuction';
import Context from '../../context';

import { database, databaseRef, databaseOnValue, databaseSet, databaseGet, databaseChild, databaseOff } from "../../firebase";

const Auctions = (props) => {
  const { authorId, auctionCategory, isGrid } = props;

  const [auctions, setAuctions] = useState();

  const { user } = useContext(Context);

  const navigation = useNavigation();

  useEffect(() => {
    loadAuctions();
    return () => {
      setAuctions([]);
      const auctionsRef = databaseRef(database, 'auctions');
      databaseOff(auctionsRef);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
    return () => {
      setAuctions([]);
      const auctionsRef = databaseRef(database, 'auctions');
      databaseOff(auctionsRef);
    }
  }, [auctionCategory]);

  const getUser = async (id) => {
    if (!id) {
      return null;
    }
    const ref = databaseRef(database);
    const snapshot = await databaseGet(databaseChild(ref, `users/${id}`));
    if (!snapshot || !snapshot.exists()) {
      return null
    }
    return snapshot.val();
  }

  const hasLiked = (auction, user) => {
    if (!auction || !user) {
      return false;
    }
    if (!auction.likes || !auction.likes.length) {
      return false
    }
    return auction.likes.includes(user.id);
  };

  const hasFollowed = (author, user) => {
    if (!author || !user) {
      return false;
    }
    if (!author.followers || !author.followers.length) {
      return false;
    }
    return author.followers.includes(user.id);
  };

  const transformAuctions = async (auctions) => {
    if (!auctions || !auctions.length) {
      return [];
    }
    const transformedAuctions = [];
    for (const Auction of auctions) {
      if ((authorId && auction.author.id !== authorId) || (auctionCategory && auction.auctionCategory !== auctionCategory)) {
        continue;
      }
      const author = await getUser(auction.author.id);
      auction.hasFollowed = hasFollowed(author, user);
      auction.hasLiked = hasLiked(auction, user);
      transformedAuctions.push(auction);
    }
    return transformedAuctions;
  };

  const loadAuctions = () => {
    const auctionsRef = databaseRef(database, 'auctions');
    databaseOnValue(auctionsRef, async (snapshot) => {
      const values = snapshot.val();
      if (values) {
        const keys = Object.keys(values);
        const auctions = keys.map(key => values[key]);
        const transformedAuctions = await transformAuctions(auctions);
        setAuctions(() => transformedAuctions);
      } else {
        setAuctions(() => []);
      }
    });
  };

  const updateLikes = (auction) => {
    if (!auction) {
      return;
    }
    if (auction.hasLiked) {
      return auction.likes && auction.likes.length ? auction.likes.filter(like => like !== user.id) : [];
    }
    return auction.likes && auction.likes.length ? [...auction.likes, user.id] : [user.id];
  }

  const createNotification = async ({ id, notificationImage, notificationMessage, receiverId }) => {
    if (!id || !notificationImage || !notificationMessage) {
      return;
    }
    await databaseSet(databaseRef(database, 'notifications/' + id), { id, notificationImage, notificationMessage, receiverId });
  };

  const sendCustomMessage = ({ message, type, receiverId }) => {
    const receiverID = receiverId;
    const customType = type;
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    const customData = { message };
    const customMessage = new CometChat.CustomMessage(receiverID, receiverType, customType, customData);
    CometChat.sendCustomMessage(customMessage).then(
      message => {
      },
      error => {
      }
    );
  };

  const toggleLike = async (auction) => {
    if (!auction) {
      return;
    }
    const likes = updateLikes(auction);
    const nLikes = likes.length;
    const updatedAuction = { id: auction.id, content: auction.content, author: { ...auction.author }, likes, nLikes, auctionCategory: auction.auctionCategory, auctionDesc: auction.auctionDesc };
    databaseSet(databaseRef(database, 'auctions/' + updatedAuction.id), updatedAuction);
    if (!auction.hasLiked && auction.author.id !== user.id) { 
      const notificationId = uuidv4();
      const customMessage = { message: `${user.fullname} has liked your auction`, type: 'notification', receiverId: auction.author.id};
      await createNotification({ id: notificationId, notificationImage: user.avatar, notificationMessage: customMessage.message, receiverId: customMessage.receiverId });
      sendCustomMessage(customMessage);
    }
  };

  const updateFolowers = (hasFollowed, author) => {
    if (!author) {
      return;
    }
    if (hasFollowed) {
      return author.followers && author.followers.length ? author.followers.filter(follower => follower !== user.id) : [];
    }
    return author.followers && author.followers.length ? [...author.followers, user.id] : [user.id];
  };

  const toggleFollow = async (auction) => {
    if (!auction) {
      return;
    }
    const author = await getUser(auction.author.id);
    if (!author) {
      return;
    }
    const followers = updateFolowers(auction.hasFollowed, author);
    const nFollowers = followers.length;
    author.followers = followers;
    author.nFollowers = nFollowers;
    await databaseSet(databaseRef(database, 'users/' + author.id), author);
    if (!auction.hasFollowed && auction.author.id !== user.id) { 
      const notificationId = uuidv4();
      const customMessage = { message: `${user.fullname} has followed you`, type: 'notification', receiverId: author.id };
      await createNotification({ id: notificationId, notificationImage: user.avatar, notificationMessage: customMessage.message, receiverId: customMessage.receiverId});
      sendCustomMessage(customMessage);
    }
    loadAuctions();
  };

  const onItemClicked = (auction) => {
    navigation.navigate('Detail', { auction });
  };

  const renderItems = (item) => {
    const auction = item.item;
    if (isGrid) {
      return <ProfileAuction auction={auction} onItemClicked={onItemClicked} />;
    }
    return <Auction auction={auction} toggleLike={toggleLike} toggleFollow={toggleFollow} onItemClicked={onItemClicked} isFollowHidden={user && user.id === auction.author.id} />;
  };

  const getKey = (item) => {
    return item.id;
  };

  return (
    <View style={styles.list}>
      <FlatList
        numColumns={isGrid ? 3 : 1}
        data={auctions}
        renderItem={renderItems}
        keyExtractor={(item, index) => getKey(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 4,
  }
});

export default Auctions;