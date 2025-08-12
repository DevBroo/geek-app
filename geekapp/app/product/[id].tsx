import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  Share,
  Animated,
  Easing,
  ImageSourcePropType
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCart, Product } from '../../context/CartContext';

// Mock product data - in a real app, this would come from an API
const productData = [
  { 
    id: 1, 
    title: 'Laptop Pro', 
    image: require('../../assets/images/geeklappylogo.png'), 
    rating: 4.8, 
    reviewCount: 120, 
    originalPrice: 1099.99, 
    discountPercentage: 18,
    description: 'The Laptop Pro is a high-performance laptop designed for professionals. It features a powerful processor, ample RAM, and a stunning display for all your computing needs.',
    specifications: [
      { name: 'Processor', value: 'Intel Core i7-12700H' },
      { name: 'RAM', value: '16GB DDR4' },
      { name: 'Storage', value: '512GB SSD' },
      { name: 'Display', value: '15.6" 4K OLED' },
      { name: 'Graphics', value: 'NVIDIA RTX 3060 6GB' },
      { name: 'Battery', value: '8-hour battery life' },
      { name: 'Weight', value: '1.8 kg' },
      { name: 'Warranty', value: '1 Year Manufacturer Warranty' }
    ],
    colors: ['Space Gray', 'Silver', 'Midnight Blue'],
    variants: [
      { id: 101, name: '8GB/256GB', price: 899.99 },
      { id: 102, name: '16GB/512GB', price: 1099.99 },
      { id: 103, name: '32GB/1TB', price: 1499.99 }
    ],
    inStock: true,
    stockQuantity: 15,
    deliveryEstimate: '2-3 business days',
    returnPolicy: '30-day return policy',
    highlights: [
      'Latest generation processor',
      'Ultra-fast SSD storage',
      'Stunning 4K display',
      'All-day battery life',
      'Premium build quality'
    ],
    reviews: [
      { id: 1, user: 'John D.', rating: 5, comment: 'Excellent laptop! Fast performance and great display.', date: '2 weeks ago' },
      { id: 2, user: 'Sarah M.', rating: 4, comment: 'Very good laptop. Battery life could be better.', date: '1 month ago' },
      { id: 3, user: 'Robert K.', rating: 5, comment: 'Best laptop I\'ve ever owned. Worth every penny!', date: '1 month ago' }
    ],
    additionalImages: [
      require('../../assets/images/geeklappylogo.png'),
      require('../../assets/images/geeklappylogo.png'),
      require('../../assets/images/geeklappylogo.png'),
      require('../../assets/images/geeklappylogo.png')
    ],
    warranty: '1 Year Manufacturer Warranty',
    seller: 'GeekLappy Official Store',
    sellerRating: 4.9,
    sellerReviews: 1250,
    emi: {
      available: true,
      minAmount: 83.33,
      months: [3, 6, 9, 12, 18, 24]
    },
    offers: [
      'Get 5% instant discount with GeekLappy Pay',
      'No Cost EMI available on select cards',
      'Exchange your old laptop and get up to $300 off'
    ],
    faq: [
      { 
        question: 'Does this laptop support external monitors?', 
        answer: 'Yes, it has HDMI and Thunderbolt ports that support up to two 4K external displays.' 
      },
      { 
        question: 'Is the RAM upgradable?', 
        answer: 'Yes, the RAM can be upgraded up to 64GB.' 
      },
      { 
        question: 'Does it come with pre-installed Windows?', 
        answer: 'Yes, it comes with Windows 11 Home pre-installed.' 
      }
    ]
  },
  { 
    id: 2, 
    title: 'Gaming Mouse', 
    image: require('../../assets/images/geeklappylogo.png'), 
    rating: 3.7, 
    reviewCount: 85, 
    originalPrice: 79.99, 
    discountPercentage: 38,
    description: 'The Gaming Mouse is designed for serious gamers. It features high precision sensors, customizable buttons, and RGB lighting for an enhanced gaming experience.',
    specifications: [
      { name: 'DPI', value: 'Up to 16,000' },
      { name: 'Buttons', value: '8 programmable buttons' },
      { name: 'Connection', value: 'Wired USB' },
      { name: 'RGB', value: 'Customizable RGB lighting' },
      { name: 'Weight', value: '95g (adjustable)' },
      { name: 'Polling Rate', value: '1000Hz' },
      { name: 'Warranty', value: '2 Year Manufacturer Warranty' }
    ],
    colors: ['Black', 'White', 'RGB'],
    variants: [
      { id: 201, name: 'Standard', price: 49.99 },
      { id: 202, name: 'Pro', price: 79.99 },
      { id: 203, name: 'Wireless', price: 99.99 }
    ],
    inStock: true,
    stockQuantity: 50,
    deliveryEstimate: '1-2 business days',
    returnPolicy: '15-day return policy',
    highlights: [
      'High-precision sensor',
      'Customizable buttons',
      'Ergonomic design',
      'RGB lighting',
      'Lightweight construction'
    ],
    reviews: [
      { id: 1, user: 'Alex G.', rating: 4, comment: 'Great mouse for gaming. Very responsive.', date: '1 week ago' },
      { id: 2, user: 'Mike T.', rating: 3, comment: 'Good mouse but a bit expensive for what it offers.', date: '3 weeks ago' },
      { id: 3, user: 'Lisa R.', rating: 4, comment: 'Comfortable to use for long gaming sessions.', date: '1 month ago' }
    ],
    additionalImages: [
      require('../../assets/images/geeklappylogo.png'),
      require('../../assets/images/geeklappylogo.png'),
      require('../../assets/images/geeklappylogo.png')
    ],
    warranty: '2 Year Manufacturer Warranty',
    seller: 'GeekLappy Official Store',
    sellerRating: 4.9,
    sellerReviews: 1250,
    emi: {
      available: true,
      minAmount: 16.66,
      months: [3, 6, 9, 12]
    },
    offers: [
      'Get 5% instant discount with GeekLappy Pay',
      'Buy 2 gaming accessories and get 10% off'
    ],
    faq: [
      { 
        question: 'Is this mouse compatible with Mac?', 
        answer: 'Yes, it works with both Windows and Mac OS.' 
      },
      { 
        question: 'Does it require special software?', 
        answer: 'Yes, for customizing buttons and RGB lighting, you need to install the GeekLappy Gaming Hub software.' 
      }
    ]
  },
  // Add more products as needed
];

// Mock pincode data for delivery availability check
const validPincodes = ['110001', '110002', '110003', '400001', '400002', '500001', '600001'];

// Delivery details for different pincodes
const pincodeDetails = {
  '110001': { deliveryDays: '1-2', cod: true, express: true },
  '110002': { deliveryDays: '2-3', cod: true, express: false },
  '110003': { deliveryDays: '1-2', cod: true, express: true },
  '400001': { deliveryDays: '3-4', cod: true, express: false },
  '400002': { deliveryDays: '2-3', cod: false, express: true },
  '500001': { deliveryDays: '3-5', cod: true, express: false },
  '600001': { deliveryDays: '4-5', cod: false, express: false }
};

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const { addToCart, addToFavorites, isInFavorites, isInCart, getCartQuantity, increaseQuantity, decreaseQuantity } = useCart();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // State variables
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [showAllSpecifications, setShowAllSpecifications] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<any[]>([]);
  
  // Fetch product data
  useEffect(() => {
    console.log('Product ID:', id); // Debug log
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
    
    // Simulate API call
    setTimeout(() => {
      // Convert id to number, ensuring it's a valid number
      const productId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
      console.log('Looking for product with ID:', productId); // Debug log
      
      const foundProduct = productData.find(p => p.id === productId);
      console.log('Found product:', foundProduct ? 'Yes' : 'No'); // Debug log
      
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedVariant(foundProduct.variants[0]);
        setSelectedColor(foundProduct.colors[0]);
        
        // Add to recently viewed
        setRecentlyViewedProducts(prev => {
          // Filter out the current product if it's already in the list
          const filtered = prev.filter(p => p.id !== foundProduct.id);
          // Add the current product to the beginning of the list
          return [foundProduct, ...filtered].slice(0, 4);
        });
      } else {
        console.log('Product not found for ID:', productId); // Debug log
      }
      setLoading(false);
    }, 500);
  }, [id]);
  
  // Check if product is in favorites
  const isFavorite = product ? isInFavorites(product.id) : false;
  
  // Check if product is in cart and get its quantity
  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getCartQuantity(product.id) : 0;
  
  // Calculate discounted price
  const getDiscountedPrice = () => {
    if (!product) return 0;
    return selectedVariant 
      ? selectedVariant.price 
      : product.originalPrice * (1 - product.discountPercentage / 100);
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    const productToAdd: Product = {
      id: product.id,
      title: product.title,
      image: product.image,
      rating: product.rating,
      reviewCount: product.reviewCount,
      originalPrice: selectedVariant ? selectedVariant.price : product.originalPrice,
      discountPercentage: product.discountPercentage
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd);
    }
    
    Alert.alert(
      'Added to Cart',
      `${product.title} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => router.push('/cart') }
      ]
    );
  };
  
  // Handle add to favorites
  const handleAddToFavorites = () => {
    if (!product) return;
    
    const productToAdd: Product = {
      id: product.id,
      title: product.title,
      image: product.image,
      rating: product.rating,
      reviewCount: product.reviewCount,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage
    };
    
    addToFavorites(productToAdd);
    
    if (!isFavorite) {
      Alert.alert('Added to Favorites', `${product.title} has been added to your favorites!`);
    }
  };
  
  // Share product
  const handleShareProduct = async () => {
    if (!product) return;
    
    try {
      await Share.share({
        message: `Check out this amazing ${product.title} on GeekLappy! Only $${getDiscountedPrice().toFixed(2)}. https://geeklappy.com/product/${product.id}`
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };
  
  // Check delivery availability by pincode
  const checkDeliveryAvailability = () => {
    if (!pincode || pincode.length < 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
      return;
    }
    
    setCheckingDelivery(true);
    
    // Simulate API call to check pincode
    setTimeout(() => {
      const isAvailable = validPincodes.includes(pincode);
      setDeliveryAvailable(isAvailable);
      
      if (isAvailable) {
        setDeliveryDetails(pincodeDetails[pincode as keyof typeof pincodeDetails]);
      } else {
        setDeliveryDetails(null);
      }
      
      setCheckingDelivery(false);
    }, 1000);
  };
  
  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="mt-4 text-gray-600">Loading product details...</Text>
      </SafeAreaView>
    );
  }
  
  // Render product not found
  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-xl font-bold">Product Not Found</Text>
        <Text className="mt-2 text-gray-600">The product you're looking for doesn't exist.</Text>
        <TouchableOpacity 
          className="mt-6 bg-yellow-500 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <Stack.Screen 
        options={{
          title: product.title,
          headerRight: () => (
            <View className="flex-row">
              <TouchableOpacity 
                className="mr-4"
                onPress={handleShareProduct}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="share-social-outline" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="mr-4"
                onPress={handleAddToFavorites}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                {isFavorite ? (
                  <Ionicons name="heart" size={24} color="#FF3B30" />
                ) : (
                  <Ionicons name="heart-outline" size={24} color="#333" />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/cart')}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="cart-outline" size={24} color="#333" />
                {cartQuantity > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                    <Text className="text-white text-xs font-bold">{cartQuantity}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Product Images */}
          <View className="bg-white">
            <View className="relative">
              <TouchableOpacity 
                onPress={() => setShowImageModal(true)}
                activeOpacity={0.9}
              >
                <Image 
                  source={product.additionalImages && product.additionalImages.length > 0 
                    ? product.additionalImages[imageIndex] 
                    : product.image} 
                  style={{ width: '100%', height: 320, resizeMode: 'contain' }} 
                />
                
                {/* Zoom hint */}
                <View className="absolute bottom-4 right-4 bg-black bg-opacity-60 px-2 py-1 rounded-md flex-row items-center">
                  <Ionicons name="search" size={16} color="white" />
                  <Text className="text-white text-xs ml-1">Tap to zoom</Text>
                </View>
              </TouchableOpacity>
              
              {/* Favorite button overlay */}
              <TouchableOpacity 
                className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded-full shadow-md"
                onPress={handleAddToFavorites}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                {isFavorite ? (
                  <Ionicons name="heart" size={24} color="#FF3B30" />
                ) : (
                  <Ionicons name="heart-outline" size={24} color="#333" />
                )}
              </TouchableOpacity>
              
              {/* Share button overlay */}
              <TouchableOpacity 
                className="absolute top-4 left-4 bg-white bg-opacity-80 p-2 rounded-full shadow-md"
                onPress={handleShareProduct}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="share-social-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Image Pagination Dots */}
            <View className="flex-row justify-center mt-3 mb-2">
              {(product.additionalImages || [product.image]).map((_: any, index: number) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => setImageIndex(index)}
                >
                  <View
                    className={`h-2 w-${index === imageIndex ? '6' : '2'} rounded-full mx-1 ${index === imageIndex ? 'bg-yellow-500' : 'bg-gray-300'}`}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Thumbnail Images */}
            {product.additionalImages && product.additionalImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-4">
                {product.additionalImages.map((image: ImageSourcePropType, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => setImageIndex(index)}
                    className={`mr-2 border-2 rounded-md ${index === imageIndex ? 'border-yellow-500' : 'border-transparent'}`}
                  >
                    <Image 
                      source={image} 
                      style={{ width: 60, height: 60, resizeMode: 'contain' }} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
          {/* Product Info */}
          <View className="bg-white mt-2 p-4">
            <Text className="text-2xl font-bold">{product.title}</Text>
            
            {/* Ratings and Reviews */}
            <View className="flex-row items-center mt-2">
              <View className={`px-2 py-1 rounded-md ${product.rating >= 4.0 ? 'bg-green-500' : product.rating >= 3.0 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                <Text className="text-white text-xs font-bold">{product.rating.toFixed(1)}</Text>
              </View>
              <View className="flex-row items-center ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star}
                    name={star <= Math.round(product.rating) ? "star" : "star-outline"} 
                    size={16} 
                    color="#F59E0B" 
                  />
                ))}
              </View>
              <TouchableOpacity 
                className="ml-2"
                onPress={() => setActiveTab('reviews')}
              >
                <Text className="text-sm text-blue-600 underline">{product.reviewCount} reviews</Text>
              </TouchableOpacity>
            </View>
            
            {/* Seller Info */}
            <View className="flex-row items-center mt-3 bg-gray-50 p-2 rounded-md">
              <Ionicons name="business-outline" size={18} color="#4B5563" />
              <Text className="text-gray-600 ml-1">Sold by </Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">{product.seller}</Text>
              </TouchableOpacity>
              <View className="flex-row items-center ml-2">
                <Text className="text-sm text-gray-700">{product.sellerRating}</Text>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-sm text-gray-500 ml-1">({product.sellerReviews})</Text>
              </View>
            </View>
            
            {/* Stock Status */}
            <View className="mt-3">
              {product.inStock ? (
                <View className="flex-row items-center bg-green-50 p-2 rounded-md">
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text className="text-green-700 text-sm ml-1 font-medium">In Stock</Text>
                  {product.stockQuantity && product.stockQuantity < 20 && (
                    <Text className="text-red-500 text-xs ml-2 font-medium">
                      Only {product.stockQuantity} left
                    </Text>
                  )}
                  <Text className="text-gray-500 text-xs ml-auto">Delivery: {product.deliveryEstimate}</Text>
                </View>
              ) : (
                <View className="flex-row items-center bg-red-50 p-2 rounded-md">
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                  <Text className="text-red-700 text-sm ml-1 font-medium">Out of Stock</Text>
                </View>
              )}
            </View>
            
            {/* Price */}
            <View className="mt-4 bg-yellow-50 p-3 rounded-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-3xl font-bold text-gray-900">${getDiscountedPrice().toFixed(2)}</Text>
                  <View className="ml-3">
                    <Text className="text-gray-400 line-through text-sm">
                      ${selectedVariant ? product.originalPrice.toFixed(2) : product.originalPrice.toFixed(2)}
                    </Text>
                    <View className="bg-red-500 px-2 py-0.5 rounded mt-1">
                      <Text className="text-white text-xs font-bold">{product.discountPercentage}% OFF</Text>
                    </View>
                  </View>
                </View>
                
                {/* Return Policy */}
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="return-down-back-outline" size={16} color="#4B5563" />
                  <Text className="text-xs text-gray-600 ml-1">{product.returnPolicy}</Text>
                </TouchableOpacity>
              </View>
              
              <Text className="text-xs text-green-600 mt-2 font-medium">✓ Inclusive of all taxes</Text>
              
              {/* EMI Option */}
              {product.emi && product.emi.available && (
                <TouchableOpacity 
                  className="mt-2 flex-row items-center bg-white p-2 rounded-md" 
                  onPress={() => setShowEmiModal(true)}
                >
                  <Ionicons name="card-outline" size={18} color="#4B5563" />
                  <Text className="text-sm text-gray-700 ml-1 font-medium">
                    EMI from ${product.emi.minAmount.toFixed(2)}/month
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#4B5563" className="ml-auto" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Offers */}
          {product.offers && product.offers.length > 0 && (
            <View className="bg-white mt-2 p-4">
              <Text className="text-lg font-bold mb-2">Available Offers</Text>
              {product.offers.map((offer: string, index: number) => (
                <View key={index} className="flex-row items-center mt-1">
                  <Ionicons name="gift-outline" size={18} color="#F59E0B" />
                  <Text className="text-gray-700 ml-2">{offer}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <View className="bg-white mt-2 p-4">
              <Text className="text-lg font-bold mb-2">Variants</Text>
              <View className="flex-row flex-wrap">
                {product.variants.map((variant: any) => (
                  <TouchableOpacity 
                    key={variant.id}
                    className={`border rounded-lg px-4 py-2 mr-2 mb-2 ${selectedVariant && selectedVariant.id === variant.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}
                    onPress={() => setSelectedVariant(variant)}
                  >
                    <Text className={`${selectedVariant && selectedVariant.id === variant.id ? 'text-yellow-700 font-bold' : 'text-gray-700'}`}>
                      {variant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <View className="bg-white mt-2 p-4">
              <Text className="text-lg font-bold mb-2">Colors</Text>
              <View className="flex-row flex-wrap">
                {product.colors.map((color: string) => (
                  <TouchableOpacity 
                    key={color}
                    className={`border rounded-lg px-4 py-2 mr-2 mb-2 ${selectedColor === color ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text className={`${selectedColor === color ? 'text-yellow-700 font-bold' : 'text-gray-700'}`}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Delivery Availability */}
          <View className="bg-white mt-2 p-4">
            <Text className="text-lg font-bold mb-2">Check Delivery Availability</Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2"
                placeholder="Enter Pincode"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />
              <TouchableOpacity 
                className="bg-yellow-500 rounded-r-lg px-4 py-2"
                onPress={checkDeliveryAvailability}
                disabled={checkingDelivery}
              >
                {checkingDelivery ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold">Check</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {deliveryAvailable !== null && (
              <View className={`mt-3 p-3 rounded-lg ${deliveryAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Text className={`${deliveryAvailable ? 'text-green-700' : 'text-red-700'} font-medium`}>
                  {deliveryAvailable 
                    ? `✓ Delivery available to ${pincode}` 
                    : `✗ Sorry, delivery not available to ${pincode}.`
                  }
                </Text>
                
                {deliveryDetails && (
                  <View className="mt-2">
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={16} color={deliveryAvailable ? "#047857" : "#B91C1C"} />
                      <Text className={`ml-2 ${deliveryAvailable ? 'text-green-700' : 'text-red-700'}`}>
                        Expected delivery in {deliveryDetails.deliveryDays} business days
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="cash-outline" size={16} color={deliveryDetails.cod ? "#047857" : "#B91C1C"} />
                      <Text className={`ml-2 ${deliveryDetails.cod ? 'text-green-700' : 'text-red-700'}`}>
                        {deliveryDetails.cod ? 'Cash on Delivery available' : 'Cash on Delivery not available'}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="flash-outline" size={16} color={deliveryDetails.express ? "#047857" : "#B91C1C"} />
                      <Text className={`ml-2 ${deliveryDetails.express ? 'text-green-700' : 'text-red-700'}`}>
                        {deliveryDetails.express ? 'Express Delivery available' : 'Express Delivery not available'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            <View className="mt-4 flex-row items-center">
              <Ionicons name="refresh-outline" size={20} color="#4B5563" />
              <Text className="ml-2 text-gray-600">{product.returnPolicy}</Text>
            </View>
            
            <View className="mt-2 flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#4B5563" />
              <Text className="ml-2 text-gray-600">{product.warranty}</Text>
            </View>
          </View>
          
          {/* Highlights */}
          <View className="bg-white mt-2 p-4">
            <Text className="text-lg font-bold mb-2">Highlights</Text>
            <View>
              {product.highlights.map((highlight: string, index: number) => (
                <View key={index} className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                  <Text className="text-gray-700">{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Tabs for Description, Specifications, Reviews, FAQ */}
          <View className="bg-white mt-2">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="border-b border-gray-200"
            >
              <TouchableOpacity 
                className={`py-3 px-4 ${activeTab === 'description' ? 'border-b-2 border-yellow-500' : ''}`}
                onPress={() => setActiveTab('description')}
              >
                <Text className={`text-center font-semibold ${activeTab === 'description' ? 'text-yellow-500' : 'text-gray-600'}`}>
                  Description
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`py-3 px-4 ${activeTab === 'specifications' ? 'border-b-2 border-yellow-500' : ''}`}
                onPress={() => setActiveTab('specifications')}
              >
                <Text className={`text-center font-semibold ${activeTab === 'specifications' ? 'text-yellow-500' : 'text-gray-600'}`}>
                  Specifications
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`py-3 px-4 ${activeTab === 'reviews' ? 'border-b-2 border-yellow-500' : ''}`}
                onPress={() => setActiveTab('reviews')}
              >
                <Text className={`text-center font-semibold ${activeTab === 'reviews' ? 'text-yellow-500' : 'text-gray-600'}`}>
                  Reviews
                </Text>
              </TouchableOpacity>
              
              {product.faq && product.faq.length > 0 && (
                <TouchableOpacity 
                  className={`py-3 px-4 ${activeTab === 'faq' ? 'border-b-2 border-yellow-500' : ''}`}
                  onPress={() => setActiveTab('faq')}
                >
                  <Text className={`text-center font-semibold ${activeTab === 'faq' ? 'text-yellow-500' : 'text-gray-600'}`}>
                    FAQ
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <View className="p-4">
              {activeTab === 'description' && (
                <Text className="text-gray-700 leading-6">{product.description}</Text>
              )}
              
              {activeTab === 'specifications' && (
                <View>
                  {(showAllSpecifications ? product.specifications : product.specifications.slice(0, 4)).map((spec: any, index: number) => (
                    <View key={index} className="flex-row py-2 border-b border-gray-100">
                      <Text className="flex-1 text-gray-600">{spec.name}</Text>
                      <Text className="flex-1 text-gray-800 font-medium">{spec.value}</Text>
                    </View>
                  ))}
                  
                  {product.specifications.length > 4 && (
                    <TouchableOpacity 
                      className="mt-3"
                      onPress={() => setShowAllSpecifications(!showAllSpecifications)}
                    >
                      <Text className="text-yellow-500 font-semibold text-center">
                        {showAllSpecifications ? 'Show Less' : 'Show All Specifications'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              {activeTab === 'reviews' && (
                <View>
                  <View className="flex-row items-center mb-4">
                    <Text className="text-4xl font-bold">{product.rating.toFixed(1)}</Text>
                    <View className="ml-4">
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons 
                            key={star}
                            name={star <= Math.round(product.rating) ? "star" : "star-outline"} 
                            size={20} 
                            color="#F59E0B" 
                          />
                        ))}
                      </View>
                      <Text className="text-gray-600 mt-1">{product.reviewCount} reviews</Text>
                    </View>
                  </View>
                  
                  {(showAllReviews ? product.reviews : product.reviews.slice(0, 2)).map((review: any) => (
                    <View key={review.id} className="mb-4 pb-4 border-b border-gray-100">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-semibold">{review.user}</Text>
                        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
                          <Text className="text-sm font-bold mr-1">{review.rating}</Text>
                          <Ionicons name="star" size={14} color="#F59E0B" />
                        </View>
                      </View>
                      <Text className="text-gray-500 text-xs mt-1">{review.date}</Text>
                      <Text className="mt-2 text-gray-700">{review.comment}</Text>
                    </View>
                  ))}
                  
                  {product.reviews.length > 2 && (
                    <TouchableOpacity 
                      className="mt-2"
                      onPress={() => setShowAllReviews(!showAllReviews)}
                    >
                      <Text className="text-yellow-500 font-semibold text-center">
                        {showAllReviews ? 'Show Less' : 'View All Reviews'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    className="mt-4 border border-yellow-500 rounded-lg py-2"
                  >
                    <Text className="text-yellow-500 font-semibold text-center">Write a Review</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {activeTab === 'faq' && product.faq && (
                <View>
                  {product.faq.map((faq: any, index: number) => (
                    <View key={index} className="mb-4 pb-4 border-b border-gray-100">
                      <Text className="font-semibold text-gray-800">{faq.question}</Text>
                      <Text className="mt-1 text-gray-600">{faq.answer}</Text>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    className="mt-2 flex-row items-center justify-center"
                    onPress={() => setShowFaqModal(true)}
                  >
                    <Text className="text-yellow-500 font-semibold">Ask a Question</Text>
                    <Ionicons name="help-circle-outline" size={20} color="#F59E0B" className="ml-1" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Similar Products */}
          <View className="bg-white mt-2 p-4">
            <Text className="text-lg font-bold mb-2">Similar Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {productData.filter(p => p.id !== product.id).map((similarProduct) => (
                <TouchableOpacity 
                  key={similarProduct.id}
                  className="mr-4 w-40"
                  onPress={() => {
                    router.push(`/product/${similarProduct.id}`);
                  }}
                >
                  <Image 
                    source={similarProduct.image} 
                    style={{ width: '100%', height: 100, resizeMode: 'contain' }} 
                  />
                  <Text className="mt-2 font-medium" numberOfLines={2}>{similarProduct.title}</Text>
                  <Text className="text-yellow-500 font-bold mt-1">
                    ${(similarProduct.originalPrice * (1 - similarProduct.discountPercentage / 100)).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Recently Viewed Products */}
          {recentlyViewedProducts.length > 1 && (
            <View className="bg-white mt-2 p-4">
              <Text className="text-lg font-bold mb-2">Recently Viewed</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentlyViewedProducts.filter(p => p.id !== product.id).map((viewedProduct) => (
                  <TouchableOpacity 
                    key={viewedProduct.id}
                    className="mr-4 w-40"
                    onPress={() => {
                      router.push(`/product/${viewedProduct.id}`);
                    }}
                  >
                    <Image 
                      source={viewedProduct.image} 
                      style={{ width: '100%', height: 100, resizeMode: 'contain' }} 
                    />
                    <Text className="mt-2 font-medium" numberOfLines={2}>{viewedProduct.title}</Text>
                    <Text className="text-yellow-500 font-bold mt-1">
                      ${(viewedProduct.originalPrice * (1 - viewedProduct.discountPercentage / 100)).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex-row shadow-lg">
        {inCart ? (
          <View className="flex-row items-center justify-between flex-1">
            <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
              <TouchableOpacity 
                className="bg-white w-8 h-8 rounded-full justify-center items-center shadow-sm"
                onPress={() => decreaseQuantity(product.id)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="remove" size={20} color="#333" />
              </TouchableOpacity>
              
              <Text className="font-bold text-lg mx-4">{cartQuantity}</Text>
              
              <TouchableOpacity 
                className="bg-white w-8 h-8 rounded-full justify-center items-center shadow-sm"
                onPress={() => increaseQuantity(product.id)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="bg-yellow-500 px-6 py-3 rounded-lg ml-4 flex-1 items-center shadow-md"
              onPress={() => router.push('/cart')}
              style={{ 
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8
              }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="cart" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Go to Cart</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center justify-between flex-1">
            {product.inStock ? (
              <>
                <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                  <TouchableOpacity 
                    className="bg-white w-8 h-8 rounded-full justify-center items-center shadow-sm"
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="remove" size={20} color="#333" />
                  </TouchableOpacity>
                  
                  <Text className="font-bold text-lg mx-4">{quantity}</Text>
                  
                  <TouchableOpacity 
                    className="bg-white w-8 h-8 rounded-full justify-center items-center shadow-sm"
                    onPress={() => setQuantity(quantity + 1)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="add" size={20} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  className="bg-yellow-500 px-6 py-3 rounded-lg ml-4 flex-1 items-center shadow-md"
                  onPress={handleAddToCart}
                  style={{ 
                    shadowColor: "#F59E0B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="cart" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Add to Cart</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <View className="flex-1 flex-row">
                <TouchableOpacity 
                  className="bg-gray-300 px-6 py-3 rounded-lg flex-1 items-center"
                  disabled={true}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="alert-circle-outline" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Out of Stock</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-blue-500 px-6 py-3 rounded-lg ml-4 items-center shadow-md"
                  onPress={() => Alert.alert(
                    'Notify Me', 
                    'We\'ll notify you when this product is back in stock.',
                    [{ text: 'OK', onPress: () => console.log('Notification set') }]
                  )}
                  style={{ 
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="notifications-outline" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Notify Me</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-end p-4">
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-1 justify-center items-center">
              <Image 
                source={product.additionalImages && product.additionalImages.length > 0 
                  ? product.additionalImages[imageIndex] 
                  : product.image} 
                style={{ width: '100%', height: 400, resizeMode: 'contain' }} 
              />
            </View>
            
            {product.additionalImages && product.additionalImages.length > 0 && (
              <View className="p-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {product.additionalImages.map((image: ImageSourcePropType, index: number) => (
                    <TouchableOpacity 
                      key={index}
                      onPress={() => setImageIndex(index)}
                      className={`mr-2 border-2 rounded-md ${index === imageIndex ? 'border-yellow-500' : 'border-transparent'}`}
                    >
                      <Image 
                        source={image} 
                        style={{ width: 60, height: 60, resizeMode: 'contain' }} 
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
      
      {/* EMI Modal */}
      <Modal
        visible={showEmiModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmiModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">EMI Options</Text>
              <TouchableOpacity onPress={() => setShowEmiModal(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-700 mb-4">
              Pay for your purchase in easy installments with our EMI options.
            </Text>
            
            <View className="mb-4">
              {product.emi.months.map((month: number) => {
                const monthlyAmount = getDiscountedPrice() / month;
                return (
                  <View key={month} className="flex-row justify-between py-3 border-b border-gray-100">
                    <Text className="text-gray-700">{month} Months</Text>
                    <Text className="font-semibold">${monthlyAmount.toFixed(2)}/month</Text>
                  </View>
                );
              })}
            </View>
            
            <Text className="text-xs text-gray-500 mb-4">
              *EMI is available on select credit cards. Terms and conditions apply.
            </Text>
            
            <TouchableOpacity 
              className="bg-yellow-500 py-3 rounded-lg items-center"
              onPress={() => setShowEmiModal(false)}
            >
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* FAQ Modal */}
      <Modal
        visible={showFaqModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFaqModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Ask a Question</Text>
              <TouchableOpacity onPress={() => setShowFaqModal(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-24 mb-4"
              placeholder="Type your question here..."
              multiline={true}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              className="bg-yellow-500 py-3 rounded-lg items-center mb-4"
              onPress={() => {
                Alert.alert('Question Submitted', 'We will notify you when your question is answered.');
                setShowFaqModal(false);
              }}
            >
              <Text className="text-white font-bold">Submit Question</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}