import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import VerifyCurrentPassword from './VerifyCurrentPassword';

interface SecurityProps {
  navigation: {
    goBack: () => void;
    navigateToVerifyPassword?: () => void;
    navigate?: (screen: string) => void;
  }; 
}

const Security = ({ navigation }: SecurityProps) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotificationsEnabled, setLoginNotificationsEnabled] = useState(true);
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Security</Text>
      </View>
      
      <ScrollView className="flex-1">
        {/* Password Management Section */}
        <View className="bg-white rounded-xl p-5 mx-4 mt-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Password Management</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center mr-3">
              <Ionicons name="lock-closed-outline" size={20} color="#FFBF00" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-800">Password</Text>
              <Text className="text-sm text-gray-500">Last changed 30 days ago</Text>
            </View>
            <TouchableOpacity 
              className="bg-[#FFBF00] px-4 py-2 rounded-lg"
              onPress={() => {
                console.log("Button pressed");
                if (navigation.navigateToVerifyPassword) {
                  console.log("Using navigateToVerifyPassword");
                  navigation.navigateToVerifyPassword();
                } else if (navigation.navigate) {
                  console.log("Using navigate");
                  navigation.navigate('VerifyCurrentPassword');
                } else {
                  console.log("No navigation method available");
                }
              }}
            >
              <Text className="text-white text-sm font-medium">Change</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-blue-50 p-3 rounded-lg">
            <Text className="text-sm text-blue-800">
              We recommend changing your password regularly to keep your account secure.
            </Text>
          </View>
        </View>
        
        {/* Additional Security Options */}
        <View className="bg-white rounded-xl p-5 mx-4 mt-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Security Options</Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Ionicons name="finger-print-outline" size={22} color="#FFBF00" />
              </View>
              <View>
                <Text className="text-base text-gray-800">Biometric Login</Text>
                <Text className="text-xs text-gray-500">Use fingerprint or face recognition to login</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={22} color="#FFBF00" />
              </View>
              <View>
                <Text className="text-base text-gray-800">Two-Factor Authentication</Text>
                <Text className="text-xs text-gray-500">Add an extra layer of security to your account</Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Ionicons name="notifications-outline" size={22} color="#FFBF00" />
              </View>
              <View>
                <Text className="text-base text-gray-800">Login Notifications</Text>
                <Text className="text-xs text-gray-500">Get notified of new logins to your account</Text>
              </View>
            </View>
            <Switch
              value={loginNotificationsEnabled}
              onValueChange={setLoginNotificationsEnabled}
              trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Recent Activity */}
        <View className="bg-white rounded-xl p-5 mx-4 mt-6 mb-8 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-sm text-[#FFBF00] font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="border-l-4 border-green-500 pl-3 py-1 mb-4">
            <Text className="text-base text-gray-800">Login from Chrome on Windows</Text>
            <Text className="text-xs text-gray-500">Today, 10:30 AM • IP: 192.168.1.1</Text>
          </View>
          
          <View className="border-l-4 border-green-500 pl-3 py-1 mb-4">
            <Text className="text-base text-gray-800">Login from GeekLappy App on iPhone</Text>
            <Text className="text-xs text-gray-500">Yesterday, 6:45 PM • IP: 192.168.1.2</Text>
          </View>
          
          <View className="border-l-4 border-yellow-500 pl-3 py-1">
            <Text className="text-base text-gray-800">Password Changed</Text>
            <Text className="text-xs text-gray-500">July 15, 2023, 3:20 PM</Text>
          </View>
        </View>
        
        {/* Security Tips */}
        <View className="bg-white rounded-xl p-5 mx-4 mb-8 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Security Tips</Text>
          
          <View className="flex-row items-start mb-3">
            <View className="w-6 h-6 rounded-full bg-blue-100 justify-center items-center mt-0.5 mr-3">
              <Text className="text-blue-600 text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-800 font-medium">Use a strong password</Text>
              <Text className="text-sm text-gray-600 mt-1">
                Create a unique password with a mix of letters, numbers, and symbols.
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-start mb-3">
            <View className="w-6 h-6 rounded-full bg-blue-100 justify-center items-center mt-0.5 mr-3">
              <Text className="text-blue-600 text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-800 font-medium">Enable two-factor authentication</Text>
              <Text className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to protect your account.
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-start">
            <View className="w-6 h-6 rounded-full bg-blue-100 justify-center items-center mt-0.5 mr-3">
              <Text className="text-blue-600 text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base text-gray-800 font-medium">Check login activity regularly</Text>
              <Text className="text-sm text-gray-600 mt-1">
                Monitor your account for any suspicious login attempts.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Security;

// Export the password change flow screens
export { default as VerifyCurrentPassword } from './VerifyCurrentPassword';
export { default as VerifyEmail } from './VerifyEmail';
export { default as SetNewPassword } from './SetNewPassword';