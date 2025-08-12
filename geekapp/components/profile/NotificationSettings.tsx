import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface NotificationSettingsProps {
  navigation: any;
}

const NotificationSettings = ({ navigation }: NotificationSettingsProps) => {
  // Notification settings state
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    
    // Push notification categories
    orderUpdates: true,
    promotions: true,
    priceDrops: true,
    backInStock: true,
    newArrivals: false,
    recommendations: true,
    
    // Email notification categories
    emailOrderUpdates: true,
    emailPromotions: true,
    emailPriceDrops: false,
    emailBackInStock: true,
    emailNewArrivals: false,
    emailRecommendations: false,
    
    // SMS notification categories
    smsOrderUpdates: false,
    smsPromotions: false,
    smsPriceDrops: false,
    smsBackInStock: false,
  });
  
  // Toggle a specific setting
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Notification Settings</Text>
      </View>
      
      <ScrollView className="flex-1">
        {/* Main Notification Channels */}
        <View className="bg-white rounded-xl p-5 mx-4 mt-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Notification Channels</Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mr-3">
                <Ionicons name="phone-portrait-outline" size={22} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-base text-gray-800">Push Notifications</Text>
                <Text className="text-xs text-gray-500">Receive notifications on your device</Text>
              </View>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => toggleSetting('pushEnabled')}
              trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 justify-center items-center mr-3">
                <Ionicons name="mail-outline" size={22} color="#10B981" />
              </View>
              <View>
                <Text className="text-base text-gray-800">Email Notifications</Text>
                <Text className="text-xs text-gray-500">Receive notifications via email</Text>
              </View>
            </View>
            <Switch
              value={settings.emailEnabled}
              onValueChange={() => toggleSetting('emailEnabled')}
              trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-purple-100 justify-center items-center mr-3">
                <Ionicons name="chatbubble-outline" size={22} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-base text-gray-800">SMS Notifications</Text>
                <Text className="text-xs text-gray-500">Receive notifications via text message</Text>
              </View>
            </View>
            <Switch
              value={settings.smsEnabled}
              onValueChange={() => toggleSetting('smsEnabled')}
              trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Push Notification Settings */}
        {settings.pushEnabled && (
          <View className="bg-white rounded-xl p-5 mx-4 mt-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Push Notifications</Text>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Order Updates</Text>
              <Switch
                value={settings.orderUpdates}
                onValueChange={() => toggleSetting('orderUpdates')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Promotions & Deals</Text>
              <Switch
                value={settings.promotions}
                onValueChange={() => toggleSetting('promotions')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Price Drops</Text>
              <Switch
                value={settings.priceDrops}
                onValueChange={() => toggleSetting('priceDrops')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Back in Stock</Text>
              <Switch
                value={settings.backInStock}
                onValueChange={() => toggleSetting('backInStock')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">New Arrivals</Text>
              <Switch
                value={settings.newArrivals}
                onValueChange={() => toggleSetting('newArrivals')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-base text-gray-800">Recommendations</Text>
              <Switch
                value={settings.recommendations}
                onValueChange={() => toggleSetting('recommendations')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}
        
        {/* Email Notification Settings */}
        {settings.emailEnabled && (
          <View className="bg-white rounded-xl p-5 mx-4 mt-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Email Notifications</Text>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Order Updates</Text>
              <Switch
                value={settings.emailOrderUpdates}
                onValueChange={() => toggleSetting('emailOrderUpdates')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Promotions & Deals</Text>
              <Switch
                value={settings.emailPromotions}
                onValueChange={() => toggleSetting('emailPromotions')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Price Drops</Text>
              <Switch
                value={settings.emailPriceDrops}
                onValueChange={() => toggleSetting('emailPriceDrops')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Back in Stock</Text>
              <Switch
                value={settings.emailBackInStock}
                onValueChange={() => toggleSetting('emailBackInStock')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">New Arrivals</Text>
              <Switch
                value={settings.emailNewArrivals}
                onValueChange={() => toggleSetting('emailNewArrivals')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-base text-gray-800">Recommendations</Text>
              <Switch
                value={settings.emailRecommendations}
                onValueChange={() => toggleSetting('emailRecommendations')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}
        
        {/* SMS Notification Settings */}
        {settings.smsEnabled && (
          <View className="bg-white rounded-xl p-5 mx-4 mt-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">SMS Notifications</Text>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Order Updates</Text>
              <Switch
                value={settings.smsOrderUpdates}
                onValueChange={() => toggleSetting('smsOrderUpdates')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Promotions & Deals</Text>
              <Switch
                value={settings.smsPromotions}
                onValueChange={() => toggleSetting('smsPromotions')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-base text-gray-800">Price Drops</Text>
              <Switch
                value={settings.smsPriceDrops}
                onValueChange={() => toggleSetting('smsPriceDrops')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-base text-gray-800">Back in Stock</Text>
              <Switch
                value={settings.smsBackInStock}
                onValueChange={() => toggleSetting('smsBackInStock')}
                trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}
        
        {/* Note */}
        <View className="bg-yellow-50 p-4 rounded-lg mx-4 mt-6 mb-8">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={20} color="#F59E0B" className="mt-0.5" />
            <Text className="text-sm text-yellow-800 ml-2 flex-1">
              You can change your notification preferences at any time. We respect your privacy and will only send you notifications based on your preferences.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettings;