import React from 'react'; 
import { Dimensions, View, Image, StyleSheet, Platform, Text } from 'react-native';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
const heightTxt = Dimensions.get('window').height;
const Detail = (props) => { 

  const { route } = props;
  const { post } = route.params;

  console.log('selected post: ');
  console.log(post);
  console.log(post.postDesc);

  const productImage = () => {
    if (!route || !post || !post.content) {
      return <></>;
    }
  
    if (post.postCategory && post.postCategory === 1) {
      
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: post.content }} />
          {/* <Text>{post.postDesc}</Text> */}
        </View>
      
    } 
    if (post.postCategory && post.postCategory === 2) { 
      if (Platform.OS === 'ios') {
        
          <View style={styles.videoContainer}>
            <Video
              style={styles.videoElement}
              shouldPlay
              muted={true}
              source={{ uri: post.content }}
              allowsExternalPlayback={false} />
          </View>
        
      }
      else (
        <View style={styles.videoContainer}>
          <VideoPlayer
            autoplay
            repeat
            showOnStart={false}
            style={styles.videoElement}
            source={{ uri: post.content }}
          />
          <View style={styles.videoOverlay} />
        </View>
      );
    };
  };

  

  return (
    <View>
      {productImage()}
      <View>
      <Text>Now</Text>
      </View>
   
  </View>
  );
  
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
    // height: heightTxt*0.3,
    height: 200,
  },
  videoContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    height: 200,
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
    height: 200,
  },  
});

export default Detail;