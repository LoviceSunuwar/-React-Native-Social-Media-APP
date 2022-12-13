import React from 'react';
import { View, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native'; 
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

const ProfileRaffle = (props) => {
  const { raffle, onItemClicked } = props;

  if (!raffle) {
    return <></>;
  }

  const clickItem = () => {
    onItemClicked(raffle);
  };

  if (raffle.raffleCategory && raffle.raffleCategory === 1) {
    return (
      <TouchableOpacity style={styles.imageRaffleContainer} onPress={clickItem}>
        <Image style={styles.imageRaffle} source={{ uri: raffle.content }} />
      </TouchableOpacity>
    );
  }
  if (raffle.raffleCategory && raffle.raffleCategory === 2) {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.videoContainer}>
          <Video
            style={styles.videoElement}
            shouldPlay
            muted={true}
            source={{ uri: raffle.content }}
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
          source={{ uri: raffle.content }}
        />
        <TouchableOpacity style={styles.videoOverlay} onPress={clickItem} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  imageRaffleContainer: { 
    flex: 1
  },
  imageraffle: { 
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

export default ProfileRaffle;