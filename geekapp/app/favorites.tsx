import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useCart, Product } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const { 
    favorites, 
    removeFromFavorites, 
    addToCart 
  } = useCart();

  // Render empty favorites
  const renderEmptyFavorites = () => (
    <View className="flex-1 justify-center items-center p-4">
      <Ionicons name="heart-outline" size={80} color="#CCCCCC" />
      <Text className="text-lg font-semibold text-gray-800 mt-4">No Favorites Yet</Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        Start adding products to your favorites to see them here.
      </Text>
      <TouchableOpacity 
        className="bg-yellow-500 px-6 py-3 rounded-full mt-6"
        onPress={() => router.push('/')}
      >
        <Text className="text-white font-bold">Explore Products</Text>
      </TouchableOpacity>
    </View>
  );

  // Render favorite item
  const renderFavoriteItem = ({ item }: { item: Product }) => {
    const discountedPrice = item.originalPrice * (1 - item.discountPercentage / 100);
    
    return (
      <View className="flex-row p-4 border-b border-gray-200">
        {/* Product Image */}
        <Image 
          source={item.image} 
          style={{ width: 80, height: 80, resizeMode: 'contain' }} 
        />
        
        {/* Product Details */}
        <View className="flex-1 ml-4">
          <Text className="font-semibold text-base">{item.title}</Text>
          
          <View className="flex-row items-center mt-1">
            <View className="bg-red-500 px-1 rounded">
              <Text className="text-white text-xs">{item.discountPercentage}% OFF</Text>
            </View>
            <Text className="text-gray-500 line-through ml-2 text-xs">${item.originalPrice.toFixed(2)}</Text>
          </View>
          
          <Text className="font-bold text-lg mt-1">${discountedPrice.toFixed(2)}</Text>
          
          {/* Rating */}
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text className="ml-1 text-sm">{item.rating.toFixed(1)}</Text>
            <Text className="text-gray-500 text-xs ml-1">({item.reviewCount})</Text>
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row mt-2">
            <TouchableOpacity 
              className="bg-yellow-500 flex-1 py-2 rounded-full mr-2 flex-row justify-center items-center"
              onPress={() => {
                addToCart(item);
                Alert.alert('Added to Cart', `${item.title} has been added to your cart!`);
              }}
            >
              <Ionicons name="cart-outline" size={18} color="white" />
              <Text className="text-white font-bold ml-1">Add to Cart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-500 py-2 px-3 rounded-full"
              onPress={() => removeFromFavorites(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">My Favorites</Text>
        </View>
      </View>
      
      {/* Favorites List */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={item => item.id.toString()}
          className="flex-1"
        />
      ) : (
        renderEmptyFavorites()
      )}
    </SafeAreaView>
  );
}