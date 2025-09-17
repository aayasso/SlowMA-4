import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setSelectedImage(imageUri);
          // Navigate to analysis screen with the selected image
          navigation.navigate('ArtworkAnalysis', { imageUri });
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header with house icon */}
      <View style={styles.header}>
        <Icon name="home" size={32} color="#2196F3" />
      </View>

      {/* Welcome text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to Slow Look</Text>
      </View>

      {/* Level section */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>Slow Look level</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>3</Text>
          <Text style={styles.levelText}>LEVEL</Text>
        </View>
      </View>

      {/* Upload button */}
      <View style={styles.uploadContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={openImagePicker}>
          <Icon name="cloud-upload" size={24} color="#2196F3" />
          <Text style={styles.uploadText}>Upload new artwork</Text>
        </TouchableOpacity>
      </View>

      {/* Recent uploads or placeholder */}
      {selectedImage && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentLabel}>Recent upload:</Text>
          <Image source={{ uri: selectedImage }} style={styles.recentImage} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  levelBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  levelText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  uploadContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 8,
  },
  recentContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  recentLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  recentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default HomeScreen;
