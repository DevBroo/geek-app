import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VerifyCurrentPasswordProps {
  navigation: any;
}

const VerifyCurrentPassword = ({ navigation }: VerifyCurrentPasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyPassword = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    setIsLoading(true);

    // Simulate API call to verify password
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, any password is accepted
      // In a real app, you would verify with your backend
      navigation.navigate('VerifyEmail');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Verify Password</Text>
        </View>
        
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-blue-50 justify-center items-center mb-4">
              <Ionicons name="lock-closed-outline" size={40} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">Verify Your Password</Text>
            <Text className="text-center text-gray-500">
              For your security, please enter your current password to continue
            </Text>
          </View>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2 font-medium">Current Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPassword}
                className="flex-1 p-4 text-gray-800"
                placeholder="Enter your current password"
                autoFocus
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="px-4"
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            className={`py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-[#FFBF00]'}`}
            onPress={handleVerifyPassword}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-center">
              {isLoading ? 'Verifying...' : 'Continue'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="mt-4">
            <Text className="text-[#FFBF00] text-center font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyCurrentPassword;