import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface LanguageSettingsProps {
  navigation: any;
}

interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
}

const LanguageSettings = ({ navigation }: LanguageSettingsProps) => {
  const languages: Language[] = [
    { id: '1', name: 'English', nativeName: 'English', code: 'en-US' },
    { id: '2', name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN' },
    { id: '3', name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN' },
    { id: '4', name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN' },
    { id: '5', name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN' },
    { id: '6', name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN' },
    { id: '7', name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN' },
    { id: '8', name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN' },
    { id: '9', name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu-IN' },
    { id: '10', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
  ];
  
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  
  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Here you would typically update the app's language setting
  };
  
  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity 
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        selectedLanguage === item.code ? 'bg-yellow-50' : ''
      }`}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <View className="flex-1">
        <Text className="text-base text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.nativeName}</Text>
      </View>
      
      {selectedLanguage === item.code && (
        <View className="w-6 h-6 rounded-full bg-[#FFBF00] justify-center items-center">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Language</Text>
      </View>
      
      <View className="p-4 bg-blue-50">
        <Text className="text-sm text-blue-800">
          Select your preferred language. This will change the language throughout the app.
        </Text>
      </View>
      
      <FlatList
        data={languages}
        renderItem={renderLanguageItem}
        keyExtractor={item => item.id}
        className="flex-1 bg-white"
      />
      
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className="bg-[#FFBF00] py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium text-center">Apply Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LanguageSettings;