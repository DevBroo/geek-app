import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Button
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { convertSpeechToText, mockSpeechToText } from '../../services/speechToText';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define interfaces for our data types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  image: any; // Using any for simplicity, ideally use a more specific type
  isNew?: boolean;
  isFavorite: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Search = () => {
  const router = useRouter();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Wireless Mouse',
    'Mechanical Keyboard',
    'Gaming Headset',
    'USB-C Hub'
  ]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  
  // Animation values
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });
  
  // Recording animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    
    if (isRecording) {
      // Create a pulsing animation when recording
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
    }
    
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRecording, pulseAnim]);

  // Sample categories
  const categories: Category[] = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'laptops', name: 'Laptops', icon: 'laptop-outline' },
    { id: 'phones', name: 'Phones', icon: 'phone-portrait-outline' },
    { id: 'accessories', name: 'Accessories', icon: 'headset-outline' },
    { id: 'wearables', name: 'Wearables', icon: 'watch-outline' },
    { id: 'audio', name: 'Audio', icon: 'musical-notes-outline' },
  ];

  // Sample popular products data
  // Request microphone permissions when component mounts
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  useEffect(() => {
    setPopularProducts([
      {
        id: '1',
        name: 'Pro Wireless Mouse',
        category: 'accessories',
        price: 79.99,
        discountPrice: 59.99,
        rating: 4.8,
        reviewCount: 1245,
        image: require('../../assets/images/mouse1.jpg'),
        isNew: true,
        isFavorite: false
      },
      {
        id: '2',
        name: 'Mechanical Gaming Keyboard',
        category: 'accessories',
        price: 129.99,
        rating: 4.6,
        reviewCount: 856,
        image: require('../../assets/images/mouse1.jpg'),
        isFavorite: true
      },
      {
        id: '3',
        name: 'Ultra HD Monitor',
        category: 'accessories',
        price: 349.99,
        discountPrice: 299.99,
        rating: 4.7,
        reviewCount: 532,
        image: require('../../assets/images/mouse1.jpg'),
        isFavorite: false
      },
      {
        id: '4',
        name: 'Noise Cancelling Headphones',
        category: 'audio',
        price: 249.99,
        rating: 4.9,
        reviewCount: 1876,
        image: require('../../assets/images/mouse1.jpg'),
        isNew: true,
        isFavorite: true
      },
    ]);
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Add to recent searches if not already there
    if (!recentSearches.includes(query) && query.trim()) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }

    // Navigate to products listing screen with search query
    router.push({
      pathname: '/products-listing',
      params: { search: query }
    });
  };

  // Handle voice search
  const record = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      // Stop recording
      await audioRecorder.stop();
      setIsRecording(false);
      setIsLoading(true);
      
      // Get the audio file URI from the recorder
      const audioUri = audioRecorder.uri;
      
      if (!audioUri) {
        throw new Error('No audio recording found');
      }
      
      // Convert speech to text
      let transcribedText = '';
      
      try {
        // For production, use the actual API:
        // transcribedText = await convertSpeechToText(audioUri);
        
        // For development/testing, use the mock service:
        transcribedText = await mockSpeechToText();
      } catch (transcriptionError) {
        console.error('Transcription error:', transcriptionError);
        // Fallback to mock service if the API fails
        transcribedText = await mockSpeechToText();
      }
      
      // Update the search query with the transcribed text
      setSearchQuery(transcribedText);
      setIsLoading(false);
      
      // Optional: Automatically perform search with the transcribed text
      if (transcribedText.trim()) {
        // Uncomment to automatically search after transcription
        // handleSearch(transcribedText);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsLoading(false);
      Alert.alert('Recording Error', 'Failed to process recording');
    }
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove a recent search
  const removeRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(item => item !== search));
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  // Render a product item
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity className="bg-white rounded-xl overflow-hidden shadow-sm mr-4 w-[60%]">
      <View className="relative w-full h-[180px]">
        <Image source={item.image} className="w-full h-full" resizeMode="cover" />
        <TouchableOpacity className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 justify-center items-center">
          <Ionicons 
            name={item.isFavorite ? "heart" : "heart-outline"} 
            size={18} 
            color={item.isFavorite ? "#FF3B30" : "#333"} 
          />
        </TouchableOpacity>
        {item.isNew && (
          <View className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 rounded">
            <Text className="text-xs font-bold text-white">NEW</Text>
          </View>
        )}
      </View>
      
      <View className="p-3">
        <Text className="text-base font-medium text-gray-800 mb-1.5" numberOfLines={2}>{item.name}</Text>
        <View className="flex-row items-center mb-1.5">
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text className="text-sm text-gray-800 ml-1">{item.rating}</Text>
          <Text className="text-xs text-gray-500 ml-1">({item.reviewCount})</Text>
        </View>
        <View className="flex-row items-center">
          {item.discountPrice ? (
            <>
              <Text className="text-base font-semibold text-red-500">${item.discountPrice}</Text>
              <Text className="text-sm text-gray-500 line-through ml-1.5">${item.price}</Text>
            </>
          ) : (
            <Text className="text-base font-semibold text-gray-800">${item.price}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Handle category selection
  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setActiveCategory(categoryId);
    
    // Navigate to products listing with category filter if not 'all'
    if (categoryId !== 'all') {
      router.push({
        pathname: '/products-listing',
        params: { category: categoryName }
      });
    }
  };

  // Render a category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      className={`flex-row items-center px-4 py-2 mr-3 rounded-full ${activeCategory === item.id ? 'bg-yellow-500' : 'bg-gray-100'}`}
      onPress={() => handleCategorySelect(item.id, item.name)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={22} 
        color={activeCategory === item.id ? "#FFFFFF" : "#333333"} 
      />
      <Text 
        className={`text-sm font-medium ml-1.5 ${activeCategory === item.id ? 'text-white' : 'text-gray-800'}`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Animated Header */}
      <Animated.View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200 mt-8" style={{ opacity: headerOpacity }}>
        <View className={`flex-1 flex-row items-center ${isRecording ? 'bg-red-50' : 'bg-gray-100'} rounded-xl px-3 py-2 mr-3`}>
          {isRecording ? (
            <Animated.View 
              style={{ 
                transform: [{ scale: pulseAnim }],
                marginRight: 8
              }}
            >
              <Ionicons name="radio" size={20} color="#FF3B30" />
            </Animated.View>
          ) : (
            <Ionicons name="search-outline" size={20} color="#999" className="mr-2" />
          )}
          
          <TextInput
            className="flex-1 text-base text-gray-800"
            placeholder={isRecording ? "Listening..." : "Search products, brands and more..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            clearButtonMode="while-editing"
            editable={!isRecording}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => isRecording ? stopRecording() : record()}>
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={20} 
                color={isRecording ? "#FF3B30" : "#999"} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          className="w-10 h-10 rounded-xl bg-gray-100 justify-center items-center"
          onPress={() => router.push('/products-listing')}
        >
          <Ionicons name="options-outline" size={22} color="#333" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Categories */}
      <View className="bg-white py-3 border-b border-gray-200">
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
      
      {/* Main Content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F9A826" />
            <Text className="mt-3 text-base text-gray-600">Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            ListHeaderComponent={
              <Text className="text-base font-medium text-gray-600 mb-4">
                {searchResults.length} results for "{searchQuery}"
              </Text>
            }
          />
        ) : (
          <ScrollView 
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-gray-800">Recent Searches</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <Text className="text-sm text-yellow-500">Clear All</Text>
                  </TouchableOpacity>
                </View>
                
                {recentSearches.map((search, index) => (
                  <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                    <TouchableOpacity 
                      className="flex-row items-center flex-1"
                      onPress={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color="#999" />
                      <Text className="text-base text-gray-800 ml-3">{search}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                      <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* Popular Products */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-800">Popular Products</Text>
                <TouchableOpacity onPress={() => router.push('/products-listing')}>
                  <Text className="text-sm text-yellow-500">See All</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={popularProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
                snapToInterval={width * 0.6 + 16}
                decelerationRate="fast"
              />
            </View>
            
            {/* Trending Searches */}
            <View className="mb-6">
              <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-800">Trending Searches</Text>
              </View>
              
              <View className="flex-row flex-wrap">
                {['Wireless Earbuds', 'Mechanical Keyboard', 'Smart Watch', 'Gaming Mouse', 
                  'USB-C Hub', 'Laptop Stand', 'Portable SSD', 'Bluetooth Speaker'].map((tag, index) => (
                  <TouchableOpacity 
                    key={index} 
                    className="bg-white px-3 py-2 rounded-full mr-2 mb-2 border border-gray-200"
                    onPress={() => {
                      setSearchQuery(tag);
                      handleSearch(tag);
                    }}
                  >
                    <Text className="text-sm text-gray-800">{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginTop: 30,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F2F3F5',
  },
  activeCategoryItem: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 6,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  initialContent: {
    flex: 1,
    padding: 16,
  },
  recentSearchesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentSearchText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  popularProductsContainer: {
    marginBottom: 24,
  },
  popularProductsList: {
    paddingRight: 16,
  },
  productCard: {
    width: width * 0.6,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  trendingContainer: {
    marginBottom: 24,
  },
  trendingTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  trendingTagText: {
    fontSize: 14,
    color: '#333333',
  },
  resultsGrid: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 16,
  },
});