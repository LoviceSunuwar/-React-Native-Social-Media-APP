import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import Context from '../../context';
import validator from "validator";
import { storage, storageRef, uploadBytesResumable, getDownloadURL, database, databaseRef, databaseSet } from "../../firebase";

const CreateAuction = (props) => {
  const { navigation } = props;

  const [auction, setAuction] = useState(null);
  const [auctionDesc, setAuctionDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser, setHasNewAuction } = useContext(Context);
  const onAuctionDescChanged = (auctionDesc) => {
    console.log(auctionDesc);
     setAuctionDesc(() => auctionDesc);
   };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const uploadAuction = () => {
    const options = {
      mediaType: 'mixed'
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return null;
      } else if (response.assets && response.assets.length) {
        const uri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        const type = response.assets[0].type;
        if (uri && fileName) {
          const file = {
            name: fileName,
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type: type || 'video/quicktime'
          };
          setAuction(() => file);
        }
      }
    });
  };
  const isEverythingValid= ({auctionDesc}) =>{
    // console.log('no Desc', auctionDesc);
     if (validator.isEmpty( auctionDesc )) {
       console.log('nO Desc', auctionDesc);
       showMessage('Error', 'Please input the Description');
       return false;
     }
     return true;
   }

  const buildAuction = ({ id, content }) => {
    return { id, content, likes: [], nLikes: 0, auctionCategory: auction.type.includes('image') ? 1 : 2, author: { id: user.id, fullname: user.fullname, avatar: user.avatar }, auctionDesc }
  }

  
   
  const createAuction = async () => {

    if (!auction) {
      showMessage('Error', 'Please upload your auction image or video');
      return;
    }
    console.log('hya samma xa');
    if (isEverythingValid({auctionDesc})){
      
    
      setIsLoading(true);
    const storageImageRef = storageRef(storage, `auctions/${auction.name}`);
    const localFile = await fetch(auction.uri);
    const fileBlob = await localFile.blob();
    const uploadTask = uploadBytesResumable(storageImageRef, fileBlob, { contentType: auction.type });
    uploadTask.on('state_changed',
      (snapshot) => {
      },
      (error) => {
        setAuction(null);
        setIsLoading(false);
        showMessage('Error', 'Failure to create your Auction, please try again');
      },
      async () => {
        console.log('hamro desc', auctionDesc);
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        if (downloadUrl) {
          const uuid = uuidv4();
          const createdAuction = buildAuction({ id: uuid, content: downloadUrl, auctionDesc: auctionDesc });
          databaseSet(databaseRef(database, 'auctions/' + uuid), createdAuction);
          user.nAuctions = user.nAuctions ? user.nAuctions + 1 : 1;
          databaseSet(databaseRef(database, 'users/' + user.id), user);
          setUser(user);
          setIsLoading(false);
          setAuction(null);
          setHasNewAuction(true);
          showMessage('Info', "You Auction was created successfully");
          navigation.navigate('Home');
        }
      }
    );
    }
    
  };

  const renderUploadedContent = () => {
    if (!auction) {
      return (
        <TouchableOpacity style={styles.uploadContainer} onPress={uploadAuction}>
          <Image style={styles.uploadImageIcon} source={require('../../images/image-gallery.png')} />
          <Text style={styles.uploadImageTitle}>Click to upload your image and video</Text>
        </TouchableOpacity>
      );
    }
    if (auction && auction.type && auction.type.includes('image')) {
      return (
        <TouchableOpacity style={styles.auctionContainer} onPress={uploadAuction}>
          <Image style={styles.auctionContent} source={{ uri: auction.uri }} />
        </TouchableOpacity>
      );
    }
    if (auction && auction.type && auction.type.includes('video')) {
      if (Platform.OS === 'ios') {
        return (
          <View style={styles.videoContainer}>
            <Video
              style={styles.videoElement}
              shouldPlay
              muted={true}
              source={{ uri: auction.uri }}
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
            source={{ uri: auction.uri }}
          />
          <TouchableOpacity style={styles.videoOverlay} onPress={uploadAuction} />
        </View>
      );
    }
    return <></>;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  const takeDesc = () => {
    return(
      <View style={styles.descContainer}>
        <ScrollView>
        <Text
            style={styles.desc}>
            Short Description
          </Text>
          <TextInput
            placeholder="Description"
            onChangeText={onAuctionDescChanged}
            // defaultValue="{name}"
            style={styles.descText}
          />
        </ScrollView>
        
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderUploadedContent()}
      {takeDesc()}
      <TouchableOpacity style={styles.uploadBtn} onPress={createAuction}>
        <Text style={styles.uploadTxt}>Create Auction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  desc:{
    opacity: 0.9,
    left: 0,
    right:0,
    width: 100,
    display: 'flex'
  },
  descContainer:{
    marginTop:60,
    width:100,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  descText:{
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#CDCDCD',
    resizeMode: 'contain',
    right:0
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height:30
  },
  uploadImageIcon: {
    width: 96,
    height: 96
  },
  uploadImageTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 16
  },
  auctionContainer: {
    flex: 1,
    height: 30,
  },
  auctionContent: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: 'contain'
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
  uploadBtn: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    display: 'flex',
    fontSize: 18,
    fontWeight: 'bold',
    height: 56,
    justifyContent: 'center',
    margin: 16,
    marginBottom: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  uploadTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default CreateAuction;