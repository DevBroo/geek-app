import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface RewardsProps {
  navigation: any;
  route: {
    params: {
      membershipType: 'bronze' | 'silver' | 'gold' | 'platinum';
      currentPoints: number;
    }
  }
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  expiryDate: string;
  image: any;
  isExclusive: boolean;
  category: 'discount' | 'product' | 'service' | 'experience';
}

const Rewards = ({ navigation, route }: RewardsProps) => {
  const { membershipType = 'bronze', currentPoints = 520 } = route.params || {};
  
  const [activeTab, setActiveTab] = useState('all');
  const scrollViewRef = useRef<ScrollView>(null);
  const tabRefs = useRef<{[key: string]: number}>({
    all: 0,
    exclusive: 80,
    discount: 160,
    product: 240,
    service: 320,
    experience: 400
  }).current;
  
  // Function to handle tab selection and scrolling
  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    
    // Scroll to make the selected tab visible
    const position = tabRefs[tab];
    const screenWidth = Dimensions.get('window').width;
    const scrollPosition = Math.max(0, position - screenWidth / 3);
    
    scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
  };
  
  // Ensure the active tab is visible on initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      const position = tabRefs[activeTab];
      const screenWidth = Dimensions.get('window').width;
      const scrollPosition = Math.max(0, position - screenWidth / 3);
      
      scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Sample rewards data
  const allRewards: Reward[] = [
    {
      id: '1',
      title: '₹500 Off on Your Next Purchase',
      description: 'Get ₹500 off on your next purchase of ₹2000 or more',
      pointsCost: 500,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: false,
      category: 'discount'
    },
    {
      id: '2',
      title: 'Free Standard Shipping',
      description: 'Free standard shipping on your next order',
      pointsCost: 200,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: false,
      category: 'service'
    },
    {
      id: '3',
      title: 'Extended Warranty',
      description: 'Get an additional 6 months warranty on any product',
      pointsCost: 800,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: true,
      category: 'service'
    },
    {
      id: '4',
      title: 'Free Laptop Bag',
      description: 'Redeem for a premium laptop bag with any laptop purchase',
      pointsCost: 1000,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: false,
      category: 'product'
    },
    {
      id: '5',
      title: 'Priority Customer Support',
      description: 'Get priority customer support for 3 months',
      pointsCost: 300,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: true,
      category: 'service'
    },
    {
      id: '6',
      title: 'Tech Workshop Invitation',
      description: 'Exclusive invitation to our next tech workshop',
      pointsCost: 1500,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: true,
      category: 'experience'
    },
    {
      id: '7',
      title: '10% Off on Accessories',
      description: 'Get 10% off on all accessories',
      pointsCost: 400,
      expiryDate: 'Dec 31, 2023',
      image: require('../../assets/images/geeklappylogo.png'),
      isExclusive: false,
      category: 'discount'
    },
  ];
  
  // Filter rewards based on active tab
  const getFilteredRewards = () => {
    if (activeTab === 'all') {
      return allRewards;
    } else if (activeTab === 'exclusive') {
      return allRewards.filter(reward => reward.isExclusive);
    } else {
      return allRewards.filter(reward => reward.category === activeTab);
    }
  };
  
  const filteredRewards = getFilteredRewards();
  
  // Render a reward item
  const renderRewardItem = ({ item }: { item: Reward }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl overflow-hidden shadow-sm mb-4 mx-4"
      onPress={() => {
        // Handle reward selection
      }}
    >
      <View className="relative">
        <Image 
          source={item.image} 
          className="w-full h-32"
          style={{ resizeMode: 'cover' }}
        />
        {item.isExclusive && (
          <View className="absolute top-2 right-2 bg-[#FFBF00] px-2 py-1 rounded">
            <Text className="text-white text-xs font-bold">EXCLUSIVE</Text>
          </View>
        )}
      </View>
      
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800 mb-1">{item.title}</Text>
        <Text className="text-sm text-gray-600 mb-3">{item.description}</Text>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-base font-bold text-[#FFBF00]">{item.pointsCost}</Text>
            <Text className="text-sm text-gray-600 ml-1">points</Text>
          </View>
          
          <TouchableOpacity 
            className={`px-4 py-2 rounded-lg ${
              currentPoints >= item.pointsCost ? 'bg-[#FFBF00]' : 'bg-gray-200'
            }`}
            disabled={currentPoints < item.pointsCost}
          >
            <Text 
              className={`text-sm font-medium ${
                currentPoints >= item.pointsCost ? 'text-white' : 'text-gray-500'
              }`}
            >
              Redeem
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-xs text-gray-500 mt-2">Expires: {item.expiryDate}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Rewards</Text>
      </View>
      
      {/* Points Summary */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-yellow-100 justify-center items-center mr-3">
            <Ionicons name="gift-outline" size={24} color="#FFBF00" />
          </View>
          <View>
            <Text className="text-sm text-gray-600">Available Points</Text>
            <Text className="text-2xl font-bold text-[#FFBF00]">{currentPoints}</Text>
          </View>
        </View>
      </View>
      
      {/* Category Tabs */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="py-1.5"
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity 
              className={`px-3 py-1 mx-1 rounded-full ${
                activeTab === 'all' ? 'bg-[#FFBF00]' : 'bg-gray-100'
              }`}
              onPress={() => handleTabSelect('all')}
              activeOpacity={0.7}
            >
              <Text 
                className={`${
                  activeTab === 'all' ? 'text-white' : 'text-gray-800'
                } text-xs font-medium`}
              >
                All Rewards
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`px-3 py-1 mx-1 rounded-full ${
                activeTab === 'exclusive' ? 'bg-[#FFBF00]' : 'bg-gray-100'
              }`}
              onPress={() => handleTabSelect('exclusive')}
              activeOpacity={0.7}
            >
              <Text 
                className={`${
                  activeTab === 'exclusive' ? 'text-white' : 'text-gray-800'
                } text-xs font-medium`}
              >
                Exclusive
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`px-3 py-1 mx-1 rounded-full ${
                activeTab === 'discount' ? 'bg-[#FFBF00]' : 'bg-gray-100'
              }`}
              onPress={() => handleTabSelect('discount')}
              activeOpacity={0.7}
            >
              <Text 
                className={`${
                  activeTab === 'discount' ? 'text-white' : 'text-gray-800'
                } text-xs font-medium`}
              >
                Discounts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`px-3 py-1 mx-1 rounded-full ${
                activeTab === 'product' ? 'bg-[#FFBF00]' : 'bg-gray-100'
              }`}
              onPress={() => handleTabSelect('product')}
              activeOpacity={0.7}
            >
              <Text 
                className={`${
                  activeTab === 'product' ? 'text-white' : 'text-gray-800'
                } text-xs font-medium`}
              >
                Products
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`px-3 py-1 mx-1 rounded-full ${
                activeTab === 'service' ? 'bg-[#FFBF00]' : 'bg-gray-100'
              }`}
              onPress={() => handleTabSelect('service')}
              activeOpacity={0.7}
            >
              <Text 
                className={`${
                  activeTab === 'service' ? 'text-white' : 'text-gray-800'
                } text-xs font-medium`}
              >
                Services
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`px-3 py-1 mx-1 rounded-full ${
                activeTab === 'experience' ? 'bg-[#FFBF00]' : 'bg-gray-100'
              }`}
              onPress={() => handleTabSelect('experience')}
              activeOpacity={0.7}
            >
              <Text 
                className={`${
                  activeTab === 'experience' ? 'text-white' : 'text-gray-800'
                } text-xs font-medium`}
              >
                Experiences
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      
      {/* Rewards List */}
      <FlatList
        data={filteredRewards}
        renderItem={renderRewardItem}
        keyExtractor={item => item.id}
        className="flex-1 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="alert-circle-outline" size={48} color="#CCCCCC" />
            <Text className="text-lg text-gray-400 text-center mt-4">
              No rewards available in this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Rewards;