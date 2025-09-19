import { 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  StatusBar
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

// Import the icon type from Ionicons
import { Icon } from '@expo/vector-icons/build/createIconSet';

// Define interfaces for our data structures
interface Category {
  id: number;
  name: string;
  icon: keyof typeof Ionicons.glyphMap; // Use the correct type for Ionicons
}

interface Company {
  id: number;
  name: string;
  logo: any; // Using 'any' for image require statements
}

interface Model {
  id: number;
  name: string;
  image: any;
  specs: string[];
  price: number;
}

interface FilterOption {
  id: string;
  name: string;
  values: string[];
}

// Define the navigation levels
type NavigationLevel = 'category' | 'brand' | 'model' | 'filter';

const Categories = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Laptop');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>('category');

  // Category data
  const categories: Category[] = [
    { id: 1, name: 'Laptop', icon: 'laptop-outline' },
    { id: 2, name: 'CCTV', icon: 'videocam-outline' },
    { id: 3, name: 'PC', icon: 'desktop-outline' },
    { id: 4, name: 'Mobile', icon: 'phone-portrait-outline' },
    { id: 5, name: 'Accessories', icon: 'headset-outline' },
    { id: 6, name: 'Printers', icon: 'print-outline' },
    { id: 7, name: 'Networking', icon: 'wifi-outline' },
    { id: 8, name: 'Mouse', icon: 'hardware-chip-outline' },
    { id: 9, name: 'Keyboard', icon: 'keypad-outline' },
    { id: 10, name: 'Monitors', icon: 'tv-outline' },
    { id: 11, name: 'Storage', icon: 'save-outline' },
    { id: 12, name: 'Speakers', icon: 'volume-high-outline' },
  ];

  // Sample model data for brands
  const modelsByBrand: Record<string, Model[]> = {
    'Dell': [
      { id: 1, name: 'XPS 13', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i7', '16GB RAM', '512GB SSD'], price: 1299 },
      { id: 2, name: 'Inspiron 15', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i5', '8GB RAM', '256GB SSD'], price: 699 },
      { id: 3, name: 'Alienware m15', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i9', '32GB RAM', '1TB SSD', 'RTX 3080'], price: 2199 },
      { id: 4, name: 'Latitude 14', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i5', '16GB RAM', '512GB SSD'], price: 999 },
    ],
    'HP': [
      { id: 1, name: 'Spectre x360', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i7', '16GB RAM', '1TB SSD'], price: 1399 },
      { id: 2, name: 'Pavilion 15', image: require('../../assets/images/lap1.jpg'), specs: ['AMD Ryzen 5', '8GB RAM', '512GB SSD'], price: 649 },
      { id: 3, name: 'Envy 13', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i7', '16GB RAM', '512GB SSD'], price: 1099 },
    ],
    'Lenovo': [
      { id: 1, name: 'ThinkPad X1', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i7', '16GB RAM', '1TB SSD'], price: 1599 },
      { id: 2, name: 'Yoga 9i', image: require('../../assets/images/lap1.jpg'), specs: ['Intel i7', '16GB RAM', '512GB SSD'], price: 1299 },
      { id: 3, name: 'IdeaPad 5', image: require('../../assets/images/lap1.jpg'), specs: ['AMD Ryzen 7', '16GB RAM', '512GB SSD'], price: 799 },
    ],
    'Apple': [
      { id: 1, name: 'MacBook Pro 14"', image: require('../../assets/images/lap2.jpg'), specs: ['M1 Pro', '16GB RAM', '512GB SSD'], price: 1999 },
      { id: 2, name: 'MacBook Air', image: require('../../assets/images/lap2.jpg'), specs: ['M2', '8GB RAM', '256GB SSD'], price: 1199 },
      { id: 3, name: 'MacBook Pro 16"', image: require('../../assets/images/lap2.jpg'), specs: ['M1 Max', '32GB RAM', '1TB SSD'], price: 2499 },
    ],
    'Samsung': [
      { id: 1, name: 'Galaxy S23 Ultra', image: require('../../assets/images/lap3.jpg'), specs: ['Snapdragon 8 Gen 2', '12GB RAM', '512GB Storage'], price: 1199 },
      { id: 2, name: 'Galaxy Z Fold 5', image: require('../../assets/images/lap3.jpg'), specs: ['Snapdragon 8 Gen 2', '12GB RAM', '256GB Storage'], price: 1799 },
      { id: 3, name: 'Galaxy A53', image: require('../../assets/images/lap3.jpg'), specs: ['Exynos 1280', '6GB RAM', '128GB Storage'], price: 449 },
    ],
  };

  // Filter options for different product types
  const filtersByCategory: Record<string, FilterOption[]> = {
    'Laptop': [
      { id: 'processor', name: 'Processor', values: ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2'] },
      { id: 'ram', name: 'RAM', values: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
      { id: 'storage', name: 'Storage', values: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
      { id: 'display', name: 'Display Size', values: ['13 inch', '14 inch', '15 inch', '16 inch', '17 inch'] },
    ],
    'Mobile': [
      { id: 'os', name: 'Operating System', values: ['iOS', 'Android'] },
      { id: 'ram', name: 'RAM', values: ['4GB', '6GB', '8GB', '12GB'] },
      { id: 'storage', name: 'Storage', values: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
      { id: 'camera', name: 'Camera', values: ['12MP', '48MP', '50MP', '108MP'] },
    ],
  };

  // Company data for each category
  const companiesByCategory: Record<string, Company[]> = {
    'Laptop': [
      { id: 1, name: 'Dell', logo: require('../../assets/images/dell.png') },
      { id: 2, name: 'HP', logo: require('../../assets/images/jp.jpg') },
      { id: 3, name: 'Lenovo', logo: require('../../assets/images/lenovo.png') },
      { id: 4, name: 'Apple', logo: require('../../assets/images/apple.png') },
      { id: 5, name: 'Asus', logo: require('../../assets/images/asus.png') },
      { id: 6, name: 'Acer', logo: require('../../assets/images/acer.jpg') },
      { id: 7, name: 'MSI', logo: require('../../assets/images/msi.jpg') },
      { id: 8, name: 'Microsoft', logo: require('../../assets/images/microsoft.jpg') },
    ],
    'CCTV': [
      { id: 1, name: 'Hikvision', logo: require('../../assets/images/hikvision.jpg') },
      { id: 2, name: 'Dahua', logo: require('../../assets/images/dahua.png') },
      { id: 3, name: 'Axis', logo: require('../../assets/images/axis.png') },
      { id: 4, name: 'Bosch', logo: require('../../assets/images/bosch.png') },
      { id: 5, name: 'Hanwha', logo: require('../../assets/images/hanwha.png') },
    ],
    'PC': [
      { id: 1, name: 'Dell', logo: require('../../assets/images/dell.png') },
      { id: 2, name: 'HP', logo: require('../../assets/images/jp.jpg') },
      { id: 3, name: 'Lenovo', logo: require('../../assets/images/lenovo.png') },
      { id: 4, name: 'Apple', logo: require('../../assets/images/apple.png') },
      { id: 5, name: 'Asus', logo: require('../../assets/images/asus.png') },
      { id: 6, name: 'Acer', logo: require('../../assets/images/acer.jpg') },
      { id: 7, name: 'MSI', logo: require('../../assets/images/msi.jpg') },
      { id: 8, name: 'Alienware', logo: require('../../assets/images/alienware.png') },
    ],
    'Mobile': [
      { id: 1, name: 'Apple', logo: require('../../assets/images/apple.png') },
      { id: 2, name: 'Samsung', logo: require('../../assets/images/samsung.jpg') },
      { id: 3, name: 'Google', logo: require('../../assets/images/google.png') },
      { id: 4, name: 'Xiaomi', logo: require('../../assets/images/xiaomi.png') },
      { id: 5, name: 'OnePlus', logo: require('../../assets/images/oneplus.png') },
      { id: 6, name: 'Oppo', logo: require('../../assets/images/oppo.png') },
      { id: 7, name: 'Vivo', logo: require('../../assets/images/vivo.png') },
      { id: 8, name: 'Motorola', logo: require('../../assets/images/motorola.png') },
    ],
    'Accessories': [
      { id: 1, name: 'Logitech', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 2, name: 'Anker', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'Belkin', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 4, name: 'JBL', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 5, name: 'Sony', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 6, name: 'Sennheiser', logo: require('../../assets/images/geeklappylogo.png') },
    ],
    'Printers': [
      { id: 1, name: 'HP', logo: require('../../assets/images/jp.jpg') },
      { id: 2, name: 'Canon', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'Epson', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 4, name: 'Brother', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 5, name: 'Xerox', logo: require('../../assets/images/geeklappylogo.png') },
    ],
    'Networking': [
      { id: 1, name: 'Cisco', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 2, name: 'TP-Link', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'Netgear', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 4, name: 'D-Link', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 5, name: 'Asus', logo: require('../../assets/images/asus.png') },
      { id: 6, name: 'Ubiquiti', logo: require('../../assets/images/geeklappylogo.png') },
    ],
    'Mouse': [
      { id: 1, name: 'Logitech', logo: require('../../assets/images/logitech.png') },
      { id: 2, name: 'Razer', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'SteelSeries', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 4, name: 'Corsair', logo: require('../../assets/images/corsair.avif') },
      { id: 5, name: 'Microsoft', logo: require('../../assets/images/microsoft.jpg') },
    ],
    'Keyboard': [
      { id: 1, name: 'Logitech', logo: require('../../assets/images/logitech.png') },
      { id: 2, name: 'Razer', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'SteelSeries', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 4, name: 'Corsair', logo: require('../../assets/images/corsair.avif') },
      { id: 5, name: 'HyperX', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 6, name: 'Ducky', logo: require('../../assets/images/geeklappylogo.png') },
    ],
    'Monitors': [
      { id: 1, name: 'Dell', logo: require('../../assets/images/dell.png') },
      { id: 2, name: 'LG', logo: require('../../assets/images/lg.png') },
      { id: 3, name: 'Samsung', logo: require('../../assets/images/samsung.jpg') },
      { id: 4, name: 'Asus', logo: require('../../assets/images/asus.png') },
      { id: 5, name: 'Acer', logo: require('../../assets/images/acer.jpg') },
      { id: 6, name: 'BenQ', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 7, name: 'ViewSonic', logo: require('../../assets/images/geeklappylogo.png') },
    ],
    'Storage': [
      { id: 1, name: 'Western Digital', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 2, name: 'Seagate', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'Samsung', logo: require('../../assets/images/samsung.jpg') },
      { id: 4, name: 'SanDisk', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 5, name: 'Crucial', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 6, name: 'Kingston', logo: require('../../assets/images/geeklappylogo.png') },
    ],
    'Speakers': [
      { id: 1, name: 'JBL', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 2, name: 'Bose', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 3, name: 'Sony', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 4, name: 'Logitech', logo: require('../../assets/images/logitech.png') },
      { id: 5, name: 'Harman Kardon', logo: require('../../assets/images/geeklappylogo.png') },
      { id: 6, name: 'Sonos', logo: require('../../assets/images/geeklappylogo.png') },
    ],
  };

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedFilters({});
    setNavigationLevel('category');
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (navigationLevel === 'filter') {
      setNavigationLevel('model');
    } else if (navigationLevel === 'model') {
      setNavigationLevel('brand');
      setSelectedModel(null);
    } else if (navigationLevel === 'brand') {
      setNavigationLevel('category');
      setSelectedBrand(null);
    }
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`flex-row items-center py-[15px] px-[15px] border-b border-[#F0F0F0] ${
        selectedCategory === item.name ? 'bg-[#F9A826]' : ''
      }`}
      onPress={() => handleCategorySelect(item.name)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.name ? "#FFFFFF" : "#000000"} 
      />
      <Text 
        className={`ml-[10px] text-[13px] ${
          selectedCategory === item.name ? 'text-white font-bold' : 'text-[#333333]'
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render company item
  const renderCompanyItem = ({ item }: { item: Company }) => (
    <TouchableOpacity 
      className="w-[46%] m-[2%] bg-white rounded-[10px] p-[15px] items-center shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={() => {
        setSelectedBrand(item.name);
        setNavigationLevel('brand');
      }}
    >
      <Image 
        source={item.logo} 
        className="w-[60px] h-[60px] mb-[10px]"
        style={{ resizeMode: 'contain' }}
      />
      <Text className="text-[14px] font-medium text-center text-[#333333]">{item.name}</Text>
    </TouchableOpacity>
  );
  
  // Render model item
  const renderModelItem = ({ item }: { item: Model }) => (
    <TouchableOpacity 
      className="w-[46%] m-[2%] bg-white rounded-[10px] overflow-hidden shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={() => {
        setSelectedModel(item.name);
        setNavigationLevel('model');
      }}
    >
      <Image 
        source={item.image} 
        className="w-full h-[140px]"
        style={{ resizeMode: 'contain' }}
      />
      <View className="p-[12px] items-center">
        <Text className="text-[15px] font-bold text-[#333333] text-center">{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  
  // Render filter options
  const renderFilterItem = ({ item }: { item: FilterOption }) => (
    <View className="mb-6">
      <Text className="text-[16px] font-bold text-[#333333] mb-3">{item.name}</Text>
      <View className="flex-row flex-wrap">
        {item.values.map((value, index) => (
          <TouchableOpacity 
            key={index}
            className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
              selectedFilters[item.id] === value 
                ? 'bg-[#F9A826] border-[#F9A826]' 
                : 'bg-white border-gray-300'
            }`}
            onPress={() => {
              setSelectedFilters(prev => ({
                ...prev,
                [item.id]: prev[item.id] === value ? '' : value
              }));
            }}
          >
            <Text 
              className={`text-[12px] font-medium ${
                selectedFilters[item.id] === value ? 'text-white' : 'text-gray-700'
              }`}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="py-[15px] px-[20px] bg-white border-b border-[#EEEEEE] mt-[30px]">
        <Text className="text-[20px] font-bold text-[#333333]">Categories</Text>
      </View>
      
      <View className="flex-1 flex-row">
        {/* Left Column - Categories */}
        <View className="w-[35%] bg-white border-r border-[#EEEEEE] mb-20">
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </View>
        
        {/* Right Column - Dynamic Content Based on Navigation Level */}
        <View className="flex-1 bg-[#F9F9F9]">
          {/* Header with Breadcrumbs */}
          <View className="py-[15px] px-[15px] border-b border-[#EEEEEE] bg-white">
            <View className="flex-row items-center">
              {navigationLevel !== 'category' && (
                <TouchableOpacity 
                  onPress={handleBackNavigation}
                  className="mr-2"
                >
                  <Ionicons name="chevron-back" size={24} color="#333333" />
                </TouchableOpacity>
              )}
              
              <View className="flex-row flex-wrap items-center">
                <Text className="text-[18px] font-bold text-[#333333]">
                  {selectedCategory}
                </Text>
                
                {selectedBrand && (
                  <>
                    <Text className="text-[18px] text-gray-400 mx-2">/</Text>
                    <Text className="text-[18px] font-bold text-[#333333]">
                      {selectedBrand}
                    </Text>
                  </>
                )}
                
                {selectedModel && (
                  <>
                    <Text className="text-[18px] text-gray-400 mx-2">/</Text>
                    <Text className="text-[18px] font-bold text-[#333333]">
                      {selectedModel}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          
          {/* Content based on navigation level */}
          {navigationLevel === 'category' && (
            <>
              <View className="py-[10px] px-[15px] bg-gray-100">
                <Text className="text-[14px] text-gray-600 font-medium">Select a Brand</Text>
              </View>
              <FlatList
                data={companiesByCategory[selectedCategory]}
                renderItem={renderCompanyItem}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 10 }}
              />
            </>
          )}
          
          {navigationLevel === 'brand' && selectedBrand && modelsByBrand[selectedBrand] && (
            <>
              <View className="py-[10px] px-[15px] bg-gray-100">
                <Text className="text-[14px] text-gray-600 font-medium">Select a Model</Text>
              </View>
              <FlatList
                data={modelsByBrand[selectedBrand]}
                renderItem={renderModelItem}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
              />
            </>
          )}
          
          {navigationLevel === 'model' && selectedCategory && filtersByCategory[selectedCategory] && (
            <>
              <View className="py-[10px] px-[15px] bg-gray-100">
                <Text className="text-[14px] text-gray-600 font-medium">Filter Options</Text>
              </View>
              <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ padding: 15 }}
                showsVerticalScrollIndicator={false}
              >
                {filtersByCategory[selectedCategory].map((filter, index) => (
                  <View key={filter.id}>
                    {renderFilterItem({ item: filter })}
                  </View>
                ))}
                
                <TouchableOpacity 
                  className="bg-[#F9A826] py-[15px] rounded-[10px] mt-4 mb-10"
                  onPress={() => {
                    // Navigate to products listing with applied filters
                    const filterParams: any = {
                      category: selectedCategory
                    };
                    
                    if (selectedBrand) {
                      filterParams.brand = selectedBrand;
                    }
                    
                    if (selectedModel) {
                      filterParams.model = selectedModel;
                    }
                    
                    // Add selected filters to params
                    if (Object.keys(selectedFilters).length > 0) {
                      filterParams.filters = JSON.stringify(selectedFilters);
                    }
                    
                    router.push({
                      pathname: '/products-listing',
                      params: filterParams
                    });
                  }}
                >
                  <Text className="text-white font-bold text-center text-[16px]">Apply Filters</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
          
          {navigationLevel === 'filter' && (
            <View className="flex-1 items-center justify-center p-6">
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text className="text-[20px] font-bold text-center mt-4 mb-2">Filters Applied!</Text>
              <Text className="text-[14px] text-gray-600 text-center mb-6">
                Your selected filters have been applied. Here are the matching products.
              </Text>
              
              {/* This would typically show filtered results */}
              <TouchableOpacity 
                className="bg-[#F9A826] py-[12px] px-[20px] rounded-[10px] mt-4"
                onPress={() => {
                  // Reset to category view
                  setNavigationLevel('category');
                  setSelectedBrand(null);
                  setSelectedModel(null);
                  setSelectedFilters({});
                }}
              >
                <Text className="text-white font-bold text-center">Start New Search</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Categories;