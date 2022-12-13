import React from 'react';
import { View, Image, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

const Auction = (props) => {
  const { auction, toggleLike, toggleFollow, onItemClicked, isFollowHidden } = props;

  const onHeartClicked = () => {
    toggleLike(auction);
  };

  const onFollowClicked = () => {
    toggleFollow(auction);
  };

  const clickItem = () => {
    onItemClicked(auction);
  };

  const renderAuctionContent = () => {
    if (auction.auctionCategory === 1) {
      return (
        <View style={styles.listItemBody}>
          <Image style={styles.listItemImage} source={{ uri: auction.content }} />

        </View>
      );
    }
    if (auction.auctionCategory === 2) {
      if (Platform.OS === 'ios') {
        return (
          <View style={styles.listItemBody}>
            <Video
              style={styles.videoElement}
              shouldPlay
              muted={true}
              source={{ uri: auction.content }}
              allowsExternalPlayback={false} />
          </View>
        );
      } else {
        return (
          <View style={styles.listItemBody}>
            <VideoPlayer
              autoplay
              repeat
              showOnStart={false}
              style={styles.videoElement}
              source={{ uri: auction.content }}
            />
            <TouchableOpacity style={styles.videoOverlay} onPress={clickItem} />
          </View>
        );
      }
    }

    return <></>;
  }

  return (
    <View >
{/* <TouchableOpacity style={styles.listItem} onPress={clickItem}> */}
      <View style={styles.listItemHeader}>
        <View style={styles.listItemAuthorAvatarContainer}>
          <Image style={styles.listItemAuthorAvatar} source={{ uri: auction.author.avatar }} />
        </View>
        <Text style={styles.listItemAuthorName}>{auction.author.fullname}</Text>
        {!isFollowHidden && <>
          <View style={styles.listItemDot}></View>
          <TouchableOpacity onPress={onFollowClicked}>
            <Text style={styles.listItemFollow}>{auction.hasFollowed ? 'Followed' : 'Follow'}</Text>
          </TouchableOpacity>
        </>}
      </View>
      {renderAuctionContent()}
      <View style={styles.listItemFooter}>
        <TouchableOpacity onPress={onHeartClicked}>
          <Image style={[styles.listItemFooterImage, styles.gap]} source={auction.hasLiked ? require('../../images/auction.png') : require('../../images/heart.png')} />
        </TouchableOpacity>
        {/* <Image style={[styles.listItemFooterImage, styles.gap2]} source={require('../../images/comment.png')} />
        <Image style={styles.listItemFooterImage} source={require('../../images/share.png')} /> */}
      </View>
      <View style={{ paddingHorizontal: 15 }}>
        {/* <Text>
          Liked by {auction.nLikes ? 'you and' : ''}{' '}
          {auction.nLikes ? auction.nLikes + 1 : auction.nLikes} others
        </Text> */}
        <Text
          style={{
            fontWeight: '700',
            fontSize: 14,
            paddingVertical: 2,
          }}>
          {auction.auctionDesc}
        </Text>
        {/* <Text style={{opacity: 0.4, paddingVertical: 2}}>
                View all comments
        </Text> */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {/* <Image
                    source={{ uri: auction.author.avatar }}
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: 100,
                      backgroundColor: 'orange',
                      marginRight: 10,
                    }}
                  /> */}
                  {/* <TextInput
                    placeholder="Add a comment "
                    style={{opacity: 0.5}}
                  /> */}
                </View>
               
                 
                
                
      </View>

    {/* </TouchableOpacity> */}
    </View>
    
  );
};

const styles = StyleSheet.create({
  listItem: {},
  listItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 8,
    marginBottom: 10
  },
  listItemAuthorAvatarContainer: {
    alignItems: 'center',
    borderRadius: 48 / 2,
    borderWidth: 2,
    borderColor: 'red',
    display: 'flex',
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  listItemAuthorAvatar: {
    borderRadius: 42 / 2,
    height: 38,
    width: 38,
  },
  listItemAuthorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12
  },
  listItemDot: {
    backgroundColor: '#000',
    borderRadius: 4 / 2,
    height: 4,
    marginRight: 12,
    marginTop: 2,
    width: 4,
  },
  listItemFollow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6'
  },
  listItemBody: {
    flex: 1,
    minHeight: 320
  },
  listItemImage: {
    aspectRatio: 1,
    flex: 1,
  },
  videoElement: {
    flex: 1
  },
  videoOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundColor: 'transparent',
    right: 0,
    top: 0,
  },
  listItemFooter: {
    padding: 8,
    paddingLeft: 16,
    flexDirection: 'row'
  },
  listItemFooterImage: {
    width: 28,
    height: 28
  },
  gap: {
    marginRight: 12
  },
  gap2: {
    marginRight: 8
  }
});

export default Auction;