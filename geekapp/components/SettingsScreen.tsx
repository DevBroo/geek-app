import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  darkModeEnabled: boolean;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  onToggleDarkMode: (value: boolean) => void;
  onToggleNotifications: (value: boolean) => void;
  onToggleBiometric: (value: boolean) => void;
  onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  visible,
  onClose,
  darkModeEnabled,
  notificationsEnabled,
  biometricEnabled,
  onToggleDarkMode,
  onToggleNotifications,
  onToggleBiometric,
  onLogout
}) => {
  // Local state for language selection
  const [language, setLanguage] = useState('English (US)');
  
  // Handle language selection
  const handleLanguageSelect = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English (US)', onPress: () => setLanguage('English (US)') },
        { text: 'Spanish', onPress: () => setLanguage('Spanish') },
        { text: 'French', onPress: () => setLanguage('French') },
        { text: 'German', onPress: () => setLanguage('German') },
        { text: 'Chinese', onPress: () => setLanguage('Chinese') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Settings</Text>
        </View>

        <ScrollView className="flex-1">
          {/* Account Settings */}
          <View className="mt-4 mx-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Account Settings</Text>
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="person-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Edit Profile</Text>
                  <Text className="text-xs text-gray-500">Change your personal information</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="lock-closed-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Change Password</Text>
                  <Text className="text-xs text-gray-500">Update your password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center p-4"
                onPress={handleLanguageSelect}
              >
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="language-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Language</Text>
                  <Text className="text-xs text-gray-500">{language}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* App Settings */}
          <View className="mt-4 mx-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">App Settings</Text>
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              <View className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="notifications-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Notifications</Text>
                  <Text className="text-xs text-gray-500">Enable push notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={onToggleNotifications}
                  trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="finger-print-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Biometric Login</Text>
                  <Text className="text-xs text-gray-500">Use fingerprint or face ID</Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={onToggleBiometric}
                  trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View className="flex-row items-center p-4">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="moon-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Dark Mode</Text>
                  <Text className="text-xs text-gray-500">Toggle dark theme</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={onToggleDarkMode}
                  trackColor={{ false: '#CCCCCC', true: '#FFBF00' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
          
          {/* Support & About */}
          <View className="mt-4 mx-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Support & About</Text>
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="help-circle-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Help Center</Text>
                  <Text className="text-xs text-gray-500">Get help with your orders and purchases</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="chatbubble-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Contact Us</Text>
                  <Text className="text-xs text-gray-500">Get in touch with our support team</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="star-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">Rate Our App</Text>
                  <Text className="text-xs text-gray-500">Tell us what you think</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center p-4">
                <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="information-circle-outline" size={22} color="#FFBF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-800">About</Text>
                  <Text className="text-xs text-gray-500">App version and information</Text>
                </View>
                <Text className="text-xs text-gray-500">v1.0.0</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity 
            className="mt-4 mx-4 mb-8 bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-center"
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text className="text-base font-medium text-red-500 ml-2">Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default SettingsScreen;