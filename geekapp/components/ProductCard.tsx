import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCart, Product } from '../context/CartContext';
import { useRouter } from 'expo-router';

interface ProductCardProps {
  id: number;
  title: string;
  image: ImageSourcePropType;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  discountPercentage: number;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  rating,
  reviewCount,
  originalPrice,
  discountPercentage,
  onPress
}) => {
  // Initialize router
  const router = useRouter();
  
  // Calculate discounted price
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  
  // Use the cart context
  const { 
    addToCart, 
    addToFavorites, 
    isInFavorites, 
    isInCart,
    getCartQuantity,
    increaseQuantity,
    decreaseQuantity
  } = useCart();
  
  // Handle navigation to product detail
  const handleProductPress = () => {
    console.log('ProductCard: Navigating to product with ID:', id);
    
    if (onPress) {
      console.log('ProductCard: Using provided onPress handler');
      onPress();
    } else {
      console.log('ProductCard: Using internal navigation');
      // Try a more direct approach
      try {
        console.log('ProductCard: Attempting direct navigation to /product/' + id);
        router.push(`/product/${id}`);
      } catch (error) {
        console.error('ProductCard: Navigation error:', error);
        // Fallback to the structured approach
        console.log('ProductCard: Attempting structured navigation');
        router.push({
          pathname: "/product/[id]",
          params: { id: id.toString() }
        });
      }
    }
  };
  
  // Create a product object
  const product: Product = {
    id,
    title,
    image,
    rating,
    reviewCount,
    originalPrice,
    discountPercentage
  };
  
  // Check if the product is in favorites
  const isFavorite = isInFavorites(id);
  
  // Check if the product is in cart and get its quantity
  const inCart = isInCart(id);
  const quantity = getCartQuantity(id);
  
  // Determine rating background color
  const getRatingBgColor = () => {
    if (rating >= 4.0) return 'bg-green-500';
    if (rating >= 3.0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-md p-4 mr-4 mt-4" 
      style={{ width: 150 }}
      onPress={handleProductPress}
      activeOpacity={0.9}
    >
      {/* Favorite Icon */}
      <TouchableOpacity 
        className="absolute top-2 right-2 z-10"
        onPress={() => addToFavorites(product)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: 12,
          padding: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.5,
          elevation: 2
        }}
      >
        {isFavorite ? (
          <Ionicons name="heart" size={24} color="red" /> ) : (
          <Ionicons name="heart-outline" size={24} color="black" />
        )}
      </TouchableOpacity>
      
      {/* Product Image */}
      <View style={{ marginTop: 10, marginBottom: 5 }}>
        <Image 
          source={image} 
          style={{ width: '100%', height: 100, resizeMode: 'contain', borderRadius: 8 }} 
        />
      </View>
      
      {/* Review Rating */}
      <View className="flex-row items-center mt-2">
        <View className={`px-2 py-1 rounded-md ${getRatingBgColor()}`}>
          <Text className="text-white text-xs font-bold">{rating.toFixed(1)} ★</Text>
        </View>
        <Text className="text-xs ml-1 text-gray-500">({reviewCount})</Text>
      </View>
      
      {/* Product Title */}
      <Text className="mt-1 font-semibold" numberOfLines={1}>{title}</Text>
      
      {/* Original Price & Discount */}
      <View className="flex-row items-center mt-1">
        <View className="bg-red-500 px-1 rounded">
          <Text className="text-white text-xs font-bold">{discountPercentage}% OFF</Text>
        </View>
        <Text className="text-gray-400 line-through ml-2 text-xs">${originalPrice.toFixed(2)}</Text>
      </View>
      
      {/* Discounted Price */}
      <Text className="text-black-600 font-bold text-xl mt-1">${discountedPrice.toFixed(2)}</Text>

      {/* Add to Cart Button or Quantity Controls */}
      {inCart ? (
        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity 
            className="bg-gray-200 w-8 h-8 rounded-full justify-center items-center"
            onPress={() => decreaseQuantity(id)}
          >
            <Ionicons name="remove" size={20} color="black" />
          </TouchableOpacity>
          
          <Text className="font-bold">{quantity}</Text>
          
          <TouchableOpacity 
            className="bg-gray-200 w-8 h-8 rounded-full justify-center items-center"
            onPress={() => increaseQuantity(id)}
          >
            <Ionicons name="add" size={20} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          className="bg-yellow-500 px-2 py-2 rounded-full mt-2"
          style={{ 
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          }}
          activeOpacity={0.7}
          onPress={() => addToCart(product)}
        >
          <Text className="text-white text-sm font-bold text-center">Add to Cart</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default ProductCard;