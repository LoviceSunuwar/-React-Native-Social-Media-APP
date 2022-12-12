import React from 'react';
import { View, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native'; 
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

const ProfileAuction = (props) => {
  const { auction, onItemClicked } = props;

  if (!auction) {
    return <></>;
  }

  const clickItem = () => {
    onItemClicked(auction);
  };

  if (auction.auctionCategory && auction.auctionCategory === 1) {
    return (
      <TouchableOpacity style={styles.imageAuctionContainer} onPress={clickItem}>
        <Image style={styles.imageAuction} source={{ uri: auction.content }} />
      </TouchableOpacity>
    );
  }
  if (auction.auctionCategory && auction.auctionCategory === 2) {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.videoContainer}>
          <Video
            style={styles.videoElement}
            shouldPlay
            muted={true}
            source={{ uri: auction.content }}
            resizeMode='cover'
            allowsExternalPlayback={false} />
            <TouchableOpacity style={styles.videoOverlay} onPress={clickItem} />
        </View>
      );
    }
    return (
      <View style={styles.videoContainer}>
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
};

const styles = StyleSheet.create({
  imageauctionContainer: { 
    flex: 1
  },
  imageauction: { 
    flex: 1,
    aspectRatio: 1
  },
  videoContainer: {
    flex: 1,
  },
  videoElement: {
    flex: 1
  },
  videoOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  }
});

export default ProfileAuction;