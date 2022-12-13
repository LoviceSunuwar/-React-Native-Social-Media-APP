import React from 'react'; 
import { View, Image, StyleSheet, Platform } from 'react-native';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

const RaffleDetail = (props) => { 
  const { route } = props;
  const { raffle } = route.params;

  console.log('selected raffle: ');
  console.log(raffle);

  if (!route || !raffle || !raffle.content) {
    return <></>;
  }

  if (raffle.raffleCategory && raffle.raffleCategory === 1) {
    return (
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: raffle.content }} />
      </View>
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
            allowsExternalPlayback={false} />
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
        <View style={styles.videoOverlay} />
      </View>
    );
  }

  return <></>;
};

const styles = StyleSheet.create({
  imageContainer: { 
    flex: 1,
  },
  image: { 
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  videoContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
});

export default RaffleDetail;;