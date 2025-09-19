import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart, Product } from '../context/CartContext';

const { width } = Dimensions.get('window');

interface FilterOptions {
  category?: string;
  brand?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  features?: string[];
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest';
}

interface ProductWithDetails extends Product {
  description: string;
  features: string[];
  category: string;
  brand: string;
  inStock: boolean;
  discount?: number;
}

const ProductsListing = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart, addToFavorites, isInFavorites, isInCart, getCartQuantity } = useCart();

  // State management
  const [searchQuery, setSearchQuery] = useState(params.search as string || '');
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: params.category as string || '',
    brand: [],
    priceRange: { min: 0, max: 5000 },
    rating: 0,
    features: [],
    sortBy: 'newest'
  });

  // Sample product data
  const sampleProducts: ProductWithDetails[] = [
    {
      id: 1,
      title: 'Dell XPS 13 Laptop',
      image: require('../assets/images/lap1.jpg'),
      rating: 4.7,
      reviewCount: 1245,
      originalPrice: 1299,
      discountPercentage: 15,
      description: 'Ultra-thin and light laptop with InfinityEdge display for exceptional performance and portability.',
      features: ['Intel i7', '16GB RAM', '512GB SSD', '13.3" FHD Display'],
      category: 'Laptop',
      brand: 'Dell',
      inStock: true,
      discount: 15
    },
    {
      id: 2,
      title: 'MacBook Pro 14"',
      image: require('../assets/images/lap2.jpg'),
      rating: 4.9,
      reviewCount: 2134,
      originalPrice: 1999,
      discountPercentage: 0,
      description: 'Professional laptop with M2 Pro chip, Liquid Retina XDR display, and all-day battery life.',
      features: ['M2 Pro Chip', '16GB RAM', '512GB SSD', '14.2" Retina Display'],
      category: 'Laptop',
      brand: 'Apple',
      inStock: true
    },
    {
      id: 3,
      title: 'Samsung Galaxy S23 Ultra',
      image: require('../assets/images/mobile.jpg'),
      rating: 4.6,
      reviewCount: 3421,
      originalPrice: 1199,
      discountPercentage: 20,
      description: 'Premium smartphone with S Pen, 200MP camera, and advanced AI features.',
      features: ['Snapdragon 8 Gen 2', '12GB RAM', '256GB Storage', '6.8" Dynamic AMOLED'],
      category: 'Mobile',
      brand: 'Samsung',
      inStock: true,
      discount: 20
    },
    {
      id: 4,
      title: 'Logitech MX Master 3S',
      image: require('../assets/images/mouse1.jpg'),
      rating: 4.5,
      reviewCount: 856,
      originalPrice: 99,
      discountPercentage: 25,
      description: 'Advanced wireless mouse with ultra-fast scrolling and cross-computer control.',
      features: ['Wireless', 'Ergonomic Design', '70-day Battery', '4000 DPI'],
      category: 'Mouse',
      brand: 'Logitech',
      inStock: true,
      discount: 25
    },
    {
      id: 5,
      title: 'HP Spectre x360',
      image: require('../assets/images/lap3.jpg'),
      rating: 4.3,
      reviewCount: 674,
      originalPrice: 1399,
      discountPercentage: 10,
      description: 'Convertible laptop with 360-degree hinge and premium design for versatile use.',
      features: ['Intel i7', '16GB RAM', '1TB SSD', 'Touch Display'],
      category: 'Laptop',
      brand: 'HP',
      inStock: false
    },
    {
      id: 6,
      title: 'Razer DeathAdder V3',
      image: require('../assets/images/mouse1.jpg'),
      rating: 4.8,
      reviewCount: 1523,
      originalPrice: 89,
      discountPercentage: 30,
      description: 'Professional gaming mouse with Focus Pro 30K sensor and ergonomic design.',
      features: ['30K DPI Sensor', 'Ergonomic Shape', 'RGB Lighting', '90-hour Battery'],
      category: 'Mouse',
      brand: 'Razer',
      inStock: true,
      discount: 30
    }
  ];

  // Initialize and filter products
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setProducts(sampleProducts);
      applyFilters(sampleProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Apply filters whenever filters or search query changes
  useEffect(() => {
    applyFilters(products);
  }, [filters, searchQuery, products]);

  const applyFilters = (productList: ProductWithDetails[]) => {
    let filtered = [...productList];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === (filters.category ?? '').toLowerCase()
      );
    }

    // Brand filter
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(product =>
        filters.brand!.includes(product.brand)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.originalPrice * (1 - product.discountPercentage / 100);
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating!);
    }

    // Sort products
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const priceA = a.originalPrice * (1 - a.discountPercentage / 100);
        const priceB = b.originalPrice * (1 - b.discountPercentage / 100);

        switch (filters.sortBy) {
          case 'price_low':
            return priceA - priceB;
          case 'price_high':
            return priceB - priceA;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return b.id - a.id;
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = () => {
    applyFilters(products);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    applyFilters(products);
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      brand: [],
      priceRange: { min: 0, max: 5000 },
      rating: 0,
      features: [],
      sortBy: 'newest'
    });
  };

  const handleBuyNow = (product: ProductWithDetails) => {
    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    // Navigate to checkout with single product
    router.push({
      pathname: '/checkout/order-summary',
      params: { productId: product.id, quantity: 1 }
    });
  };

  const handleAddToCart = (product: ProductWithDetails) => {
    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    addToCart(product);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderProductCard = ({ item }: { item: ProductWithDetails }) => {
    const discountedPrice = item.originalPrice * (1 - item.discountPercentage / 100);
    const isFavorite = isInFavorites(item.id);
    const inCart = isInCart(item.id);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-sm mb-4 mx-4 overflow-hidden border border-gray-100"
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.95}
      >
        <View className="flex-row">
          {/* Product Image */}
          <View className="relative">
            <Image
              source={item.image}
              className="w-32 h-32 bg-gray-100"
              resizeMode="contain"
            />
            
            {/* Discount Badge */}
            {item.discountPercentage > 0 && (
              <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
                <Text className="text-white text-xs font-bold">
                  {item.discountPercentage}% OFF
                </Text>
              </View>
            )}

            {/* Stock Status */}
            {!item.inStock && (
              <View className="absolute inset-0 bg-black/50 justify-center items-center">
                <Text className="text-white font-bold text-sm">Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Product Details */}
          <View className="flex-1 p-4 justify-between">
            {/* Header with title and favorite */}
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-base font-semibold text-gray-800 flex-1 pr-2" numberOfLines={2}>
                {item.title}
              </Text>
              <TouchableOpacity
                onPress={() => addToFavorites(item)}
                className="p-1"
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#EF4444" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>

            {/* Rating */}
            <View className="flex-row items-center mb-2">
              <View className={`px-2 py-1 rounded-md ${getRatingColor(item.rating)}`}>
                <Text className="text-white text-xs font-bold">
                  {item.rating.toFixed(1)} ★
                </Text>
              </View>
              <Text className="text-xs text-gray-500 ml-2">
                ({item.reviewCount} reviews)
              </Text>
            </View>

            {/* Pricing */}
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </Text>
              {item.discountPercentage > 0 && (
                <Text className="text-sm text-gray-500 line-through ml-2">
                  ${item.originalPrice.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Description */}
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
              {item.description}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row space-x-2 justify-between ">
              <TouchableOpacity
                className={`flex-1 py-2.5 rounded-lg ${
                  item.inStock ? 'bg-[#FFBF00]' : 'bg-gray-300'
                }`}
                onPress={() => handleBuyNow(item)}
                disabled={!item.inStock}
              >
                <Text className="text-white font-semibold text-center text-sm">
                  Buy Now
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-2.5 rounded-lg border ${
                  item.inStock 
                    ? inCart 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-gray-50 border-gray-300'
                    : 'bg-gray-100 border-gray-200'
                }`}
                onPress={() => handleAddToCart(item)}
                disabled={!item.inStock}
              >
                <Text className={`font-semibold text-center text-sm ${
                  item.inStock 
                    ? inCart 
                      ? 'text-green-600' 
                      : 'text-gray-700'
                    : 'text-gray-400'
                }`}>
                  {inCart ? 'Added' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Filters</Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text className="text-[#FFBF00] font-medium">Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Sort By */}
          <View className="mb-6">
            <Text className="text-base font-semibold mb-3">Sort By</Text>
            {[
              { key: 'newest', label: 'Newest First' },
              { key: 'price_low', label: 'Price: Low to High' },
              { key: 'price_high', label: 'Price: High to Low' },
              { key: 'rating', label: 'Customer Rating' }
            ].map((sort) => (
              <TouchableOpacity
                key={sort.key}
                className="flex-row items-center py-3"
                onPress={() => setFilters(prev => ({ ...prev, sortBy: sort.key as any }))}
              >
                <Ionicons
                  name={filters.sortBy === sort.key ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color="#FFBF00"
                />
                <Text className="ml-3 text-gray-700">{sort.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Brand Filter */}
          <View className="mb-6">
            <Text className="text-base font-semibold mb-3">Brand</Text>
            {['Dell', 'Apple', 'Samsung', 'HP', 'Logitech', 'Razer'].map((brand) => (
              <TouchableOpacity
                key={brand}
                className="flex-row items-center py-3"
                onPress={() => {
                  const currentBrands = filters.brand || [];
                  const updatedBrands = currentBrands.includes(brand)
                    ? currentBrands.filter(b => b !== brand)
                    : [...currentBrands, brand];
                  setFilters(prev => ({ ...prev, brand: updatedBrands }));
                }}
              >
                <Ionicons
                  name={filters.brand?.includes(brand) ? "checkbox" : "checkbox-outline"}
                  size={20}
                  color="#FFBF00"
                />
                <Text className="ml-3 text-gray-700">{brand}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Filter */}
          <View className="mb-6">
            <Text className="text-base font-semibold mb-3">Minimum Rating</Text>
            {[4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                className="flex-row items-center py-3"
                onPress={() => setFilters(prev => ({ ...prev, rating }))}
              >
                <Ionicons
                  name={filters.rating === rating ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color="#FFBF00"
                />
                <View className="flex-row items-center ml-3">
                  {[...Array(rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color="#FFD700" />
                  ))}
                  <Text className="ml-2 text-gray-700">& Above</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            className="bg-[#FFBF00] py-4 rounded-lg"
            onPress={handleApplyFilters}
          >
            <Text className="text-white font-semibold text-center text-base">
              Apply Filters ({filteredProducts.length} products)
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header with Search */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity
            className="bg-gray-100 p-2 rounded-lg"
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-sm text-gray-600">
          {isLoading 
            ? 'Searching...' 
            : `${filteredProducts.length} products found`
          }
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
      </View>

      {/* Product List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFBF00" />
          <Text className="mt-3 text-gray-600">Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
            No products found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </Text>
          <TouchableOpacity
            className="bg-[#FFBF00] px-6 py-3 rounded-lg"
            onPress={clearAllFilters}
          >
            <Text className="text-white font-semibold">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      <FilterModal />
    </SafeAreaView>
  );
};

export default ProductsListing;