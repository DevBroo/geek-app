import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Define membership types and their properties
type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

type MembershipDetails = {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pointsRequired: number;
  nextLevel: MembershipLevel | null;
  nextLevelPoints: number | null;
  benefits: string[];
};

const membershipLevels: Record<MembershipLevel, MembershipDetails> = {
  bronze: {
    name: 'Bronze',
    color: '#CD7F32',
    bgColor: '#f5efe7',
    borderColor: '#e0d0c1',
    pointsRequired: 0,
    nextLevel: 'silver',
    nextLevelPoints: 500,
    benefits: [
      'Free shipping on orders above ₹999',
      '1% GeekCash back on all purchases',
      'Early access to flash sales',
      'Birthday special offer'
    ]
  },
  silver: {
    name: 'Silver',
    color: '#C0C0C0',
    bgColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    pointsRequired: 500,
    nextLevel: 'gold',
    nextLevelPoints: 1000,
    benefits: [
      'Free shipping on all orders',
      '2% GeekCash back on all purchases',
      'Priority customer support',
      'Extended return period (15 days)',
      'Exclusive Silver member offers'
    ]
  },
  gold: {
    name: 'Gold',
    color: '#FFD700',
    bgColor: '#fffbeb',
    borderColor: '#faecc8',
    pointsRequired: 1000,
    nextLevel: 'platinum',
    nextLevelPoints: 2000,
    benefits: [
      'Free shipping on all orders',
      '3% GeekCash back on all purchases',
      'Premium customer support',
      'Extended return period (30 days)',
      'Exclusive Gold member offers',
      'Free product servicing',
      'Dedicated relationship manager'
    ]
  },
  platinum: {
    name: 'Platinum',
    color: '#E5E4E2',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    pointsRequired: 2000,
    nextLevel: null,
    nextLevelPoints: null,
    benefits: [
      'Free shipping on all orders with priority delivery',
      '5% GeekCash back on all purchases',
      'VIP customer support',
      'Extended return period (45 days)',
      'Exclusive Platinum member offers',
      'Free product servicing with pickup & drop',
      'Dedicated relationship manager',
      'Early access to new product launches',
      'Invitation to exclusive GeekLappy events',
      'Complimentary product upgrades'
    ]
  }
};

interface GeekCashDetailsProps {
  navigation: any;
  route: {
    params: {
      membershipType: MembershipLevel;
      currentPoints: number;
    }
  }
}

const GeekCashDetails = ({ navigation, route }: GeekCashDetailsProps) => {
  const { membershipType = 'bronze', currentPoints = 0 } = route.params || {};
  const membership = membershipLevels[membershipType];
  
  // Calculate progress percentage to next level
  const calculateProgress = () => {
    if (membershipType === 'platinum') return 100;
    
    const currentLevelPoints = membership.pointsRequired;
    
    // Safely access the next level
    if (!membership.nextLevel) return 100;
    
    const nextLevelPoints = membershipLevels[membership.nextLevel].pointsRequired;
    const pointsRange = nextLevelPoints - currentLevelPoints;
    const userProgress = currentPoints - currentLevelPoints;
    
    return Math.min(Math.round((userProgress / pointsRange) * 100), 100);
  };
  
  const progressPercentage = calculateProgress();
  
  return (
    <SafeAreaView className="flex-1 bg-[#111184]">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">GeekCash & Membership</Text>
      </View>
      
      <ScrollView className="flex-1">
        {/* Membership Card */}
        <View className={`mx-4 mt-6 rounded-xl overflow-hidden shadow-md`}>
          <View 
            className={`p-5`}
            style={{ 
              backgroundColor: membership.bgColor,
              borderWidth: 1,
              borderColor: membership.borderColor,
              borderRadius: 12
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-600 text-sm">GeekLappy</Text>
                <Text className="text-2xl font-bold" style={{ color: membership.color }}>
                  {membership.name} Member
                </Text>
              </View>
              <View className="w-16 h-16 overflow-hidden justify-center items-center">
                <Image 
                  source={require('../../assets/images/geeklappylogo.png')} 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    resizeMode: 'contain'
                  }}
                />
              </View>
            </View>
            
            <View className="flex-row items-center mb-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Current Points</Text>
                <Text className="text-xl font-bold" style={{ color: membership.color }}>
                  {currentPoints}
                </Text>
              </View>
              
              {membership.nextLevel && (
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Next Tier</Text>
                  <Text className="text-sm text-gray-700">
                    {membershipLevels[membership.nextLevel].pointsRequired - currentPoints} points to {membershipLevels[membership.nextLevel].name}
                  </Text>
                </View>
              )}
            </View>
            
            {membership.nextLevel && (
              <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: membership.color
                  }} 
                />
              </View>
            )}
            
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-sm text-gray-600">Member since: January 2023</Text>
              <Text className="text-sm text-gray-600 mt-1">Member ID: GK78901234</Text>
            </View>
          </View>
        </View>
        
        {/* GeekCash Value */}
        <View className="bg-white rounded-xl mx-4 mt-6 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">GeekCash Value</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-yellow-100 justify-center items-center mr-3">
              <Ionicons name="cash-outline" size={24} color="#FFBF00" />
            </View>
            <View>
              <Text className="text-gray-600">1 GeekCoin = ₹1 INR</Text>
              <Text className="text-sm text-gray-500">Use your GeekCash for purchases</Text>
            </View>
          </View>
          
          <View className="flex-row mt-4 bg-gray-50 rounded-lg p-3">
            <View className="flex-1 border-r border-gray-200 pr-3">
              <Text className="text-xs text-gray-500">Available GeekCash</Text>
              <Text className="text-lg font-bold text-green-600">₹{currentPoints}</Text>
            </View>
            <View className="flex-1 pl-3">
              <Text className="text-xs text-gray-500">Lifetime Earnings</Text>
              <Text className="text-lg font-bold text-gray-700">₹{currentPoints + 1250}</Text>
            </View>
          </View>
        </View>
        
        {/* Membership Benefits */}
        <View className="bg-white rounded-xl mx-4 mt-6 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            {membership.name} Membership Benefits
          </Text>
          
          {membership.benefits.map((benefit, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View className="w-6 h-6 rounded-full bg-green-100 justify-center items-center mr-3">
                <Ionicons name="checkmark" size={16} color="#10B981" />
              </View>
              <Text className="text-gray-700">{benefit}</Text>
            </View>
          ))}
        </View>
        
        {/* How to Earn More */}
        <View className="bg-white rounded-xl mx-4 mt-6 mb-8 p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">How to Earn More GeekCash</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mr-3">
              <Ionicons name="cart-outline" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800">Make Purchases</Text>
              <Text className="text-sm text-gray-600">
                Earn {membershipType === 'bronze' ? '1%' : membershipType === 'silver' ? '2%' : membershipType === 'gold' ? '3%' : '5%'} GeekCash on every purchase
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-purple-100 justify-center items-center mr-3">
              <Ionicons name="share-social-outline" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800">Refer Friends</Text>
              <Text className="text-sm text-gray-600">Get 100 GeekCash for each friend who makes their first purchase</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-pink-100 justify-center items-center mr-3">
              <Ionicons name="star-outline" size={20} color="#EC4899" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800">Write Reviews</Text>
              <Text className="text-sm text-gray-600">Earn 10 GeekCash for each verified product review</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-orange-100 justify-center items-center mr-3">
              <Ionicons name="calendar-outline" size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800">Special Events</Text>
              <Text className="text-sm text-gray-600">Participate in challenges and events to earn bonus GeekCash</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GeekCashDetails;