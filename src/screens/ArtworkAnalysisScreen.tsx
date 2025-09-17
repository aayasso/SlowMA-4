import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ArtworkAnalysisScreenProps {
  navigation: any;
  route: {
    params: {
      imageUri: string;
    };
  };
}

interface ArtworkInfo {
  title: string;
  artist: string;
  period: string;
  style: string;
  description: string;
  techniques: string[];
  elements: string[];
}

const ArtworkAnalysisScreen: React.FC<ArtworkAnalysisScreenProps> = ({ navigation, route }) => {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeArtwork = async () => {
      try {
        setLoading(true);
        setError(null);
        const analysis = await analyzeWithAPI(imageUri);
        setArtworkInfo(analysis);
      } catch (error) {
        console.error('Analysis error:', error);
        setError(error instanceof Error ? error.message : 'Failed to analyze artwork');
        setArtworkInfo(null);
      } finally {
        setLoading(false);
      }
    };

    analyzeArtwork();
  }, [imageUri]);

  const analyzeWithAPI = async (imageUri: string): Promise<ArtworkInfo> => {
    try {
      // Convert image URI to blob for API call
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'artwork.jpg');

      // Make actual API call to your artwork analysis service
      const apiResponse = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to analyze artwork. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Analyzing artwork...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artwork Analysis</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Artwork Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.artworkImage} />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="error" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Artwork Information */}
        {artworkInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{artworkInfo.title}</Text>
            <Text style={styles.artist}>by {artworkInfo.artist}</Text>
            <Text style={styles.period}>{artworkInfo.period}</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this artwork</Text>
              <Text style={styles.description}>{artworkInfo.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Techniques</Text>
              {artworkInfo.techniques.map((technique, index) => (
                <View key={index} style={styles.listItem}>
                  <Icon name="palette" size={16} color="#2196F3" />
                  <Text style={styles.listText}>{technique}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visual Elements</Text>
              {artworkInfo.elements.map((element, index) => (
                <View key={index} style={styles.listItem}>
                  <Icon name="visibility" size={16} color="#2196F3" />
                  <Text style={styles.listText}>{element}</Text>
                </View>
              ))}
            </View>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  artworkImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
  },
});

export default ArtworkAnalysisScreen;
