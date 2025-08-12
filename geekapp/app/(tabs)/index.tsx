import { 
  SafeAreaView, 
  Text, 
  View, 
  Image, 
  TextInput, 
  ScrollView, 
  Dimensions, 
  StyleSheet, 
  TouchableOpacity, 
  ViewBase, 
  Alert,
  FlatList,
  StatusBar as RNStatusBar,
  Platform,
  Modal
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState, useRef, useEffect } from "react";
import type { ScrollView as ScrollViewType } from "react-native";
import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import ProductCard from "../../components/ProductCard";
import NotificationsScreen from "../../components/NotificationsScreen";
import { useCart } from "../../context/CartContext";
import CustomStatusBar from "../../components/CustomStatusBar";

// Define the Notification type to match the one expected by NotificationsScreen
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system' | 'payment';
  image?: any;
}

export default function Index() {
  const router = useRouter();
  const { cartCount, favoritesCount } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollViewType>(null);
  const screenWidth = Dimensions.get('window').width;
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filter state
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  
  // Notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #GK38219 has been shipped and will arrive in 2-3 business days.',
      time: '2 hours ago',
      isRead: false,
      type: 'order'
    },
    {
      id: '2',
      title: 'Special Offer',
      message: 'Get 20% off on all accessories this weekend! Use code WEEKEND20 at checkout.',
      time: '1 day ago',
      isRead: false,
      type: 'promo'
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Your payment of $189.97 for order #GK38219 was successful.',
      time: '2 days ago',
      isRead: true,
      type: 'payment'
    },
    {
      id: '4',
      title: 'New Feature Available',
      message: 'We\'ve added a new feature to track your orders in real-time. Check it out!',
      time: '1 week ago',
      isRead: true,
      type: 'system'
    }
  ]);
  
  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark the notification as read
    setNotifications(prev => 
      prev.map(item => 
        item.id === notification.id 
          ? { ...item, isRead: true } 
          : item
      )
    );
    
    // Handle different notification types
    switch (notification.type) {
      case 'order':
        router.push('/Orders');
        setNotificationsModalVisible(false);
        break;
      case 'promo':
        // Navigate to promotions or show coupon details
        Alert.alert('Promotion', notification.message);
        break;
      case 'payment':
        router.push('/Orders');
        setNotificationsModalVisible(false);
        break;
      case 'system':
        // Show system notification details
        Alert.alert('System Update', notification.message);
        break;
      default:
        break;
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(item => ({ ...item, isRead: true }))
    );
  };
  
  // Sample banner data - replace with your actual banner images
  const banners = [
    { id: 1, image: require('../../assets/images/geeklappylogo.png'), title: 'Special Offer' },
    { id: 2, image: require('../../assets/images/geeklappylogo.png'), title: 'New Arrivals' },
    { id: 3, image: require('../../assets/images/geeklappylogo.png'), title: 'Trending Products' },
  ];
  
  // Filter data
  const priceRanges = [
    { id: 'price1', label: '₹10,000 - ₹20,000' },
    { id: 'price2', label: '₹20,000 - ₹30,000' },
    { id: 'price3', label: '₹30,000 - ₹40,000' },
    { id: 'price4', label: '₹40,000 - ₹50,000' },
    { id: 'price5', label: '₹50,000+' },
  ];
  
  const brands = [
    { id: 'brand1', label: 'Apple' },
    { id: 'brand2', label: 'Samsung' },
    { id: 'brand3', label: 'Dell' },
    { id: 'brand4', label: 'HP' },
    { id: 'brand5', label: 'Lenovo' },
    { id: 'brand6', label: 'Asus' },
    { id: 'brand7', label: 'Acer' },
  ];
  
  const discounts = [
    { id: 'discount1', label: '10% or more' },
    { id: 'discount2', label: '20% or more' },
    { id: 'discount3', label: '30% or more' },
    { id: 'discount4', label: '40% or more' },
    { id: 'discount5', label: '50% or more' },
  ];
  
  const ratings = [
    { id: 'rating5', label: '5★', value: 5 },
    { id: 'rating4', label: '4★ & above', value: 4 },
    { id: 'rating3', label: '3★ & above', value: 3 },
    { id: 'rating2', label: '2★ & above', value: 2 },
    { id: 'rating1', label: '1★ & above', value: 1 },
  ];
  
  // Handle filter selection
  const togglePriceRange = (id: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const toggleBrand = (id: string) => {
    setSelectedBrands(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const toggleDiscount = (id: string) => {
    setSelectedDiscounts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const toggleRating = (value: number) => {
    setSelectedRatings(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };
  
  // Track if any filters are applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Apply filters
  const applyFilters = () => {
    // Check if any filters are selected
    const hasFilters = 
      selectedPriceRanges.length > 0 || 
      selectedBrands.length > 0 || 
      selectedDiscounts.length > 0 || 
      selectedRatings.length > 0;
    
    setFiltersApplied(hasFilters);
    
    // Here you would implement the actual filtering logic
    // For now, we'll just close the modal
    setFilterModalVisible(false);
    
    if (hasFilters) {
      // You could show a toast or some indication that filters were applied
      Alert.alert('Filters Applied', 'Products filtered according to your selection.');
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedBrands([]);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setFiltersApplied(false);
  };
  
  // Category data
  const categories = [
    { id: 1, name: 'Laptop', image: require('../../assets/images/geeklappylogo.png'), route: '/category/laptop' },
    { id: 2, name: 'CCTV', image: require('../../assets/images/geeklappylogo.png'), route: '/category/cctv' },
    { id: 3, name: 'PC', image: require('../../assets/images/geeklappylogo.png'), route: '/category/pc' },
    { id: 4, name: 'Accessories', image: require('../../assets/images/geeklappylogo.png'), route: '/category/accessories' },
    { id: 5, name: 'Printers', image: require('../../assets/images/geeklappylogo.png'), route: '/category/printers' },
    { id: 6, name: 'Networking', image: require('../../assets/images/geeklappylogo.png'), route: '/category/networking' },
  ];
  
  // Product data for Major Offers section
  const productOffers = [
    { 
      id: 1, 
      title: 'Laptop Pro', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 4.8, 
      reviewCount: 120, 
      originalPrice: 1099.99, 
      discountPercentage: 18 
    },
    { 
      id: 2, 
      title: 'Gaming Mouse', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 3.7, 
      reviewCount: 85, 
      originalPrice: 79.99, 
      discountPercentage: 38 
    },
    { 
      id: 3, 
      title: 'Wireless Earbuds', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 4.5, 
      reviewCount: 210, 
      originalPrice: 129.99, 
      discountPercentage: 38 
    },
    { 
      id: 4, 
      title: '4K Monitor', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 4.2, 
      reviewCount: 95, 
      originalPrice: 399.99, 
      discountPercentage: 25 
    },
    { 
      id: 5, 
      title: 'Mechanical Keyboard', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 3.9, 
      reviewCount: 67, 
      originalPrice: 129.99, 
      discountPercentage: 31 
    },
    { 
      id: 6, 
      title: 'Wireless Router', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 2.8, 
      reviewCount: 42, 
      originalPrice: 99.99, 
      discountPercentage: 30 
    },
    { 
      id: 7, 
      title: 'External SSD', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 4.7, 
      reviewCount: 156, 
      originalPrice: 159.99, 
      discountPercentage: 25 
    },
    { 
      id: 8, 
      title: 'Webcam HD', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 1.9, 
      reviewCount: 28, 
      originalPrice: 89.99, 
      discountPercentage: 33 
    },
    { 
      id: 9, 
      title: 'Bluetooth Speaker', 
      image: require('../../assets/images/geeklappylogo.png'), 
      rating: 3.5, 
      reviewCount: 73, 
      originalPrice: 69.99, 
      discountPercentage: 43 
    }
  ];
  
  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeIndex === banners.length - 1) {
        setActiveIndex(0);
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      } else {
        setActiveIndex(activeIndex + 1);
        scrollViewRef.current?.scrollTo({ x: screenWidth * (activeIndex + 1), animated: true });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeIndex]);
  
  // Define the scrollable content
  const renderScrollableContent = () => {
    return (
      <View>
        

        {/* Banner Carousel */}
        <View className="mt-4">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setActiveIndex(newIndex);
            }}
          >
            {banners.map((banner, index) => (
              <View key={banner.id} style={{ width: screenWidth }}>
                <View className="mx-4 rounded-lg overflow-hidden shadow-md">
                  <Image
                    source={banner.image}
                    style={{ width: '100%', height: 180, resizeMode: 'cover' }}
                  />
                  <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 py-2 px-4">
                    <Text className="text-white font-semibold">{banner.title}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-2">
            {banners.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${index === activeIndex ? 'bg-yellow-500' : 'bg-gray-300'}`}
              />
            ))}
          </View>
        </View>
        
        <View className="mt-4 mx-4 flex-row justify-between items-center">
          <Text className="mt-4 text-xl font-bold">Category</Text>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <Text className="mt-4 ml-4 text-base font-bold text-yellow-500">See all</Text>
          </TouchableOpacity>
        </View>

        {/* Category Icons */}
        <View className="flex-column mt-4 ml-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  className="flex-column items-center mr-4"
                  // onPress={() => router.push(category.route)}
                  activeOpacity={0.7}
                >
                  <View className="bg-white rounded-full shadow-md p-2 items-center justify-center" style={{width: 90, height: 90}}>
                    <Image source={category.image} style={{width: 40, height: 40}} resizeMode="contain" />
                  </View>
                  <Text className="text-center mt-2">{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-4 mx-4 flex">
          <View className="flex-row justify-between items-center">
            <Text className="mt-4 text-xl font-bold">Major Offers</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text className="mt-4 ml-4 text-base font-bold text-yellow-500">See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {productOffers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                originalPrice={product.originalPrice}
                discountPercentage={product.discountPercentage}
                onPress={() => {
                  router.push(`/product/${product.id}`);
                }}
              />
            ))}
          </ScrollView>
        </View>


        {/* Trending Products Section */}
        <View className="mt-4 mx-4">
          <View className="flex-row justify-between items-center">
            <Text className="mt-4 text-xl font-bold">Trending Products</Text>
            <TouchableOpacity >
              <Text className="mt-4 ml-4 text-base font-bold text-yellow-500">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {productOffers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                originalPrice={product.originalPrice}
                discountPercentage={product.discountPercentage}
                onPress={() => {
                  router.push(`/product/${product.id}`);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recently Viewed Items Section */}
        <View className="mt-4 mx-4">
          <View className="flex-row justify-between items-center">
            <Text className="mt-4 text-xl font-bold">Recently Viewed Items</Text>
            <TouchableOpacity >
              <Text className="mt-4 ml-4 text-base font-bold text-yellow-500">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {productOffers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                originalPrice={product.originalPrice}
                discountPercentage={product.discountPercentage}
                onPress={() => {
                  router.push(`/product/${product.id}`);
                }}
              />
            ))}
          </ScrollView>
          <View style={{ height: 100 }} />
          {/* Add some padding at the bottom for better scrolling experience */}
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: '#FAFAFA'
    }}>
      <CustomStatusBar backgroundColor="#FAFAFA" barStyle="dark-content" />
      
      {/* Notifications Modal */}
      <NotificationsScreen
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationPress={handleNotificationPress}
      />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-4">
        <View className="flex-row items-center">
          <Image 
            source={require('../../assets/images/geeklappylogo.png')} 
            style={{ width: 40, height: 40 }} 
            resizeMode="contain"
          />
          <Text className="text-xl font-bold ml-2">GeekLappy</Text>
        </View>
        
        <View className="flex-row">
          {/* Notifications Icon */}
          <TouchableOpacity 
            className="mr-4 relative"
            onPress={() => setNotificationsModalVisible(true)}
          >
            <Ionicons name="notifications-outline" size={25} color="#666" />
            {notifications.some(n => !n.isRead) && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {notifications.filter(n => !n.isRead).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Favorites Icon */}
          <TouchableOpacity 
            className="mr-4 relative"
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="heart-outline" size={25} color="#666" />
            {favoritesCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">{favoritesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Cart Icon */}
          <TouchableOpacity 
            className="relative"
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={25} color="#666" />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View className="mx-4 mt-4">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Search products..."
            placeholderTextColor="gray"
          />
          {/* Filter Icon in Search Bar */}
        <TouchableOpacity 
          onPress={() => setFilterModalVisible(true)}
          className={`flex-row items-center rounded-full px-2 py-1 ml-2 ${
            filtersApplied ? 'bg-yellow-500' : 'bg-gray-200'
          }`}
        >
          <Ionicons 
            name="options-outline" 
            size={18} 
            color={filtersApplied ? 'white' : '#666'} 
          />
          <Text 
            className={`ml-1 text-xs ${
              filtersApplied ? 'text-white' : 'text-gray-700'
            }`}
          >
            {filtersApplied ? 'Filtered' : 'Filter'}
          </Text>
          {filtersApplied && (
            <View className="h-2 w-2 rounded-full bg-white ml-1" />
          )}
        </TouchableOpacity>

        {/* Filter Modal */}
        <Modal
          visible={filterModalVisible}
          animationType="slide"
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-800">Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1">
              <View className="p-4">
                {/* Price Range Filter */}
                <Text className="text-lg font-semibold mb-3">Price</Text>
                <View className="flex-row flex-wrap">
                  {priceRanges.map((range) => (
                    <TouchableOpacity
                      key={range.id}
                      onPress={() => togglePriceRange(range.id)}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                        selectedPriceRanges.includes(range.id)
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`${
                          selectedPriceRanges.includes(range.id)
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Brand Filter */}
                <Text className="text-lg font-semibold mt-6 mb-3">Brand</Text>
                <View className="flex-row flex-wrap">
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      onPress={() => toggleBrand(brand.id)}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                        selectedBrands.includes(brand.id)
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`${
                          selectedBrands.includes(brand.id)
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                      >
                        {brand.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Discount Filter */}
                <Text className="text-lg font-semibold mt-6 mb-3">Discount</Text>
                <View className="flex-row flex-wrap">
                  {discounts.map((discount) => (
                    <TouchableOpacity
                      key={discount.id}
                      onPress={() => toggleDiscount(discount.id)}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                        selectedDiscounts.includes(discount.id)
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`${
                          selectedDiscounts.includes(discount.id)
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                      >
                        {discount.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Ratings Filter */}
                <Text className="text-lg font-semibold mt-6 mb-3">Ratings</Text>
                <View className="flex-row flex-wrap">
                  {ratings.map((rating) => (
                    <TouchableOpacity
                      key={rating.id}
                      onPress={() => toggleRating(rating.value)}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                        selectedRatings.includes(rating.value)
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`${
                          selectedRatings.includes(rating.value)
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                      >
                        {rating.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={{ height: 100 }} />
              </View>
            </ScrollView>
            
            {/* Filter Action Buttons */}
            <View className="p-4 border-t border-gray-200 flex-row justify-between">
              <TouchableOpacity 
                onPress={resetFilters}
                className="px-6 py-3 rounded-lg border border-gray-300"
              >
                <Text className="text-gray-800 font-medium">Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={applyFilters}
                className="px-6 py-3 rounded-lg bg-yellow-500"
              >
                <Text className="text-white font-medium">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
      </View>
      
      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {renderScrollableContent()}
      </ScrollView>
    </SafeAreaView>
  );
}