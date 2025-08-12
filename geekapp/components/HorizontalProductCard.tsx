import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCart, Product } from '../context/CartContext';
import { useRouter } from 'expo-router';

interface HorizontalProductCardProps {
  id: number;
  title: string;
  image: any;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  discountPercentage: number;
  description?: string;
  inStock?: boolean;
  onPress?: () => void;
}

const HorizontalProductCard: React.FC<HorizontalProductCardProps> = ({
  id,
  title,
  image,
  rating,
  reviewCount,
  originalPrice,
  discountPercentage,
  description = '',
  inStock = true,
  onPress
}) => {
  const router = useRouter();
  const { addToCart, addToFavorites, isInFavorites, isInCart } = useCart();

  // Calculate discounted price
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);

  // Create product object
  const product: Product = {
    id,
    title,
    image,
    rating,
    reviewCount,
    originalPrice,
    discountPercentage
  };

  // Handle product press
  const handleProductPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${id}`);
    }
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    if (!inStock) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    router.push({
      pathname: '/checkout/order-summary',
      params: { productId: id, quantity: 1 }
    });
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!inStock) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    addToCart(product);
  };

  // Get rating background color based on rating value
  const getRatingBgColor = () => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isFavorite = isInFavorites(id);
  const inCart = isInCart(id);

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm mb-4 mx-4 overflow-hidden border border-gray-100"
      onPress={handleProductPress}
      activeOpacity={0.95}
    >
      <View className="flex-row">
        {/* Product Image Section */}
        <View className="relative w-32 h-32">
          <Image
            source={image}
            className="w-full h-full bg-gray-100"
            resizeMode="contain"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">
                {discountPercentage}% OFF
              </Text>
            </View>
          )}

          {/* Out of Stock Overlay */}
          {!inStock && (
            <View className="absolute inset-0 bg-black/50 justify-center items-center rounded-lg">
              <Text className="text-white font-bold text-sm">Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Details Section */}
        <View className="flex-1 p-4 justify-between">
          {/* Header with Title and Favorite Button */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-base font-semibold text-gray-800 flex-1 pr-2" numberOfLines={2}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={() => addToFavorites(product)}
              className="p-1"
              hitSlop={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          {/* Rating Section */}
          <View className="flex-row items-center mb-2">
            <View className={`px-2 py-1 rounded-md ${getRatingBgColor()}`}>
              <Text className="text-white text-xs font-bold">
                {rating.toFixed(1)} ★
              </Text>
            </View>
            <Text className="text-xs text-gray-500 ml-2">
              ({reviewCount.toLocaleString()} reviews)
            </Text>
          </View>

          {/* Pricing Section */}
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold text-gray-900">
              ${discountedPrice.toFixed(2)}
            </Text>
            {discountPercentage > 0 && (
              <Text className="text-sm text-gray-500 line-through ml-2">
                ${originalPrice.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Description */}
          {description && (
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
              {description}
            </Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg ${
                inStock ? 'bg-[#FFBF00]' : 'bg-gray-300'
              }`}
              onPress={handleBuyNow}
              disabled={!inStock}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center text-sm">
                Buy Now
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg border ${
                inStock 
                  ? inCart 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-gray-50 border-gray-300'
                  : 'bg-gray-100 border-gray-200'
              }`}
              onPress={handleAddToCart}
              disabled={!inStock}
              activeOpacity={0.8}
            >
              <Text className={`font-semibold text-center text-sm ${
                inStock 
                  ? inCart 
                    ? 'text-green-600' 
                    : 'text-gray-700'
                  : 'text-gray-400'
              }`}>
                {inCart ? 'Added ✓' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HorizontalProductCard;