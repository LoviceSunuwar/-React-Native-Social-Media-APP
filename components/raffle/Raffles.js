import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat'
import { useNavigation } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

import Context from '../../context';

import { database, databaseRef, databaseOnValue, databaseSet, databaseGet, databaseChild, databaseOff } from "../../firebase";

const Raffles = (props) => {
  const { authorId, raffleCategory, isGrid } = props;

  const [raffles, setRaffles] = useState();

  const { user } = useContext(Context);

  const navigation = useNavigation();

  useEffect(() => {
    loadRaffles();
    return () => {
      setRaffles([]);
      const rafflesRef = databaseRef(database, 'raffles');
      databaseOff(rafflesRef);
    }
  }, []);

  useEffect(() => {
    loadRaffles();
    return () => {
      setRaffles([]);
      const rafflesRef = databaseRef(database, 'raffles');
      databaseOff(rafflesRef);
    }
  }, [raffleCategory]);

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

  const hasLiked = (raffle, user) => {
    if (!raffle || !user) {
      return false;
    }
    if (!raffle.likes || !raffle.likes.length) {
      return false
    }
    return raffle.likes.includes(user.id);
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

  const transformRaffles = async (raffles) => {
    if (!raffles || !raffles.length) {
      return [];
    }
    const transformedRaffles = [];
    for (const raffle of raffles) {
      if ((authorId && raffle.author.id !== authorId) || (raffleCategory && raffle.raffleCategory !== raffleCategory)) {
        continue;
      }
      const author = await getUser(raffle.author.id);
      raffle.hasFollowed = hasFollowed(author, user);
      raffle.hasLiked = hasLiked(raffle, user);
      transformedRaffles.push(raffle);
    }
    return transformedRaffles;
  };

  const loadRaffles = () => {
    const rafflesRef = databaseRef(database, 'raffles');
    databaseOnValue(rafflesRef, async (snapshot) => {
      const values = snapshot.val();
      if (values) {
        const keys = Object.keys(values);
        const raffles = keys.map(key => values[key]);
        const transformedRaffles = await transformRaffles(raffles);
        setRaffles(() => transformedRaffles);
      } else {
        setRaffles(() => []);
      }
    });
  };

  const updateLikes = (raffle) => {
    if (!raffle) {
      return;
    }
    if (raffle.hasLiked) {
      return raffle.likes && raffle.likes.length ? raffle.likes.filter(like => like !== user.id) : [];
    }
    return raffle.likes && raffle.likes.length ? [...raffle.likes, user.id] : [user.id];
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

  const toggleLike = async (raffle) => {
    if (!raffle) {
      return;
    }
    const likes = updateLikes(raffle);
    const nLikes = likes.length;
    const updatedRaffle = { id: raffle.id, content: raffle.content, author: { ...raffle.author }, likes, nLikes, raffleCategory: raffle.raffleCategory, raffleDesc: raffle.raffleDesc };
    databaseSet(databaseRef(database, 'raffles/' + updatedRaffle.id), updatedRaffle);
    if (!raffle.hasLiked && raffle.author.id !== user.id) { 
      const notificationId = uuidv4();
      const customMessage = { message: `${user.fullname} has liked your raffle`, type: 'notification', receiverId: raffle.author.id};
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

  const toggleFollow = async (raffle) => {
    if (!raffle) {
      return;
    }
    const author = await getUser(raffle.author.id);
    if (!author) {
      return;
    }
    const followers = updateFolowers(raffle.hasFollowed, author);
    const nFollowers = followers.length;
    author.followers = followers;
    author.nFollowers = nFollowers;
    await databaseSet(databaseRef(database, 'users/' + author.id), author);
    if (!raffle.hasFollowed && raffle.author.id !== user.id) { 
      const notificationId = uuidv4();
      const customMessage = { message: `${user.fullname} has followed you`, type: 'notification', receiverId: author.id };
      await createNotification({ id: notificationId, notificationImage: user.avatar, notificationMessage: customMessage.message, receiverId: customMessage.receiverId});
      sendCustomMessage(customMessage);
    }
    loadRaffles();
  };

  const onItemClicked = (raffle) => {
    navigation.navigate('Detail', { raffle });
  };

  const renderItems = (item) => {
    const raffle = item.item;
    if (isGrid) {
      return <ProfileRaffle raffle={raffle} onItemClicked={onItemClicked} />;
    }
    return <Raffle raffle={raffle} toggleLike={toggleLike} toggleFollow={toggleFollow} onItemClicked={onItemClicked} isFollowHidden={user && user.id === raffle.author.id} />;
  };

  const getKey = (item) => {
    return item.id;
  };

  return (
    <View style={styles.list}>
      <FlatList
        numColumns={isGrid ? 3 : 1}
        data={raffles}
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

export default Raffles;