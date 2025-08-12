import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SetNewPasswordProps {
  navigation: any;
}

const SetNewPassword = ({ navigation }: SetNewPasswordProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Define the type for password strength result
  interface PasswordStrength {
    strength: number;
    label: string;
    color: string;
  }

  // Password strength checker
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { strength: 0, label: 'None', color: 'bg-gray-300' };
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    let label = '';
    let color = 'bg-gray-300'; // Default color
    
    switch (strength) {
      case 0:
      case 1:
        label = 'Weak';
        color = 'bg-red-500';
        break;
      case 2:
      case 3:
        label = 'Medium';
        color = 'bg-yellow-500';
        break;
      case 4:
      case 5:
        label = 'Strong';
        color = 'bg-green-500';
        break;
      default:
        label = 'None';
    }
    
    return { 
      strength: (strength / 5) * 100, 
      label,
      color
    };
  };
  
  const passwordStrength = getPasswordStrength(newPassword);
  
  const handleSetPassword = () => {
    // Validate password
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Check password strength
    if (passwordStrength.strength < 60) {
      Alert.alert(
        'Weak Password', 
        'Your password is not strong enough. Would you like to continue anyway?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Continue',
            onPress: () => submitPassword()
          }
        ]
      );
      return;
    }
    
    submitPassword();
  };
  
  const submitPassword = () => {
    setIsLoading(true);
    
    // Simulate API call to change password
    setTimeout(() => {
      setIsLoading(false);
      
      // Show success message
      Alert.alert(
        'Success', 
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Security')
          }
        ]
      );
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
          <Text className="text-xl font-bold text-gray-800">Set New Password</Text>
        </View>
        
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-blue-50 justify-center items-center mb-4">
              <Ionicons name="key-outline" size={40} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">Create New Password</Text>
            <Text className="text-center text-gray-500">
              Your new password must be different from your previous password
            </Text>
          </View>
          
          <View className="mb-5">
            <Text className="text-sm text-gray-600 mb-2 font-medium">New Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                className="flex-1 p-4 text-gray-800"
                placeholder="Enter new password"
                autoFocus
              />
              <TouchableOpacity 
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="px-4"
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <View className="mt-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">Password Strength</Text>
                  <Text 
                    className="text-xs font-medium" 
                    style={{ color: passwordStrength.color ? passwordStrength.color.replace('bg-', 'text-') : 'text-gray-500' }}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
                <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <View 
                    className={`h-full ${passwordStrength.color || 'bg-gray-300'}`} 
                    style={{ width: `${passwordStrength.strength}%` }} 
                  />
                </View>
              </View>
            )}
          </View>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2 font-medium">Confirm New Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                className="flex-1 p-4 text-gray-800"
                placeholder="Confirm new password"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-4"
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <View className="flex-row items-center mt-2">
                <Ionicons 
                  name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={newPassword === confirmPassword ? "#10B981" : "#EF4444"} 
                  className="mr-1"
                />
                <Text 
                  className={`text-xs ${
                    newPassword === confirmPassword ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {newPassword === confirmPassword ? "Passwords match" : "Passwords don't match"}
                </Text>
              </View>
            )}
          </View>
          
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <Text className="text-sm text-blue-800">
              Strong passwords include a mix of uppercase and lowercase letters, numbers, and special characters.
            </Text>
          </View>
          
          <TouchableOpacity 
            className={`py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-[#FFBF00]'}`}
            onPress={handleSetPassword}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-center">
              {isLoading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SetNewPassword;