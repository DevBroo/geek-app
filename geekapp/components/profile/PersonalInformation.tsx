import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PersonalInformationProps {
  navigation: any;
}

const PersonalInformation = ({ navigation }: PersonalInformationProps) => {
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '15/05/1990',
    gender: 'Male',
    avatar: require('../../assets/images/geeklappylogo.png')
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({ ...userInfo });
  
  const handleSave = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedInfo.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    // Validate phone
    const phoneRegex = /^\+?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(editedInfo.phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }
    
    // Save changes
    setUserInfo(editedInfo);
    setIsEditing(false);
    Alert.alert('Success', 'Your information has been updated successfully');
  };
  
  const handleCancel = () => {
    setEditedInfo({ ...userInfo });
    setIsEditing(false);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Personal Information</Text>
        {!isEditing && (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)} 
            className="ml-auto"
          >
            <Text className="text-[#FFBF00] font-medium">Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView className="flex-1 p-4">
        {/* Profile Picture */}
        <View className="items-center mb-6">
          <View className="relative">
            <Image 
              source={userInfo.avatar} 
              className="w-24 h-24 rounded-full"
            />
            {isEditing && (
              <TouchableOpacity 
                className="absolute bottom-0 right-0 bg-[#FFBF00] w-8 h-8 rounded-full items-center justify-center"
                onPress={() => Alert.alert('Change Photo', 'This would open the image picker')}
              >
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Form Fields */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-sm text-gray-500 mb-1">Full Name</Text>
          {isEditing ? (
            <TextInput
              value={editedInfo.name}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, name: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800 mb-4"
              placeholder="Enter your full name"
            />
          ) : (
            <Text className="text-base text-gray-800 mb-4">{userInfo.name}</Text>
          )}
          
          <Text className="text-sm text-gray-500 mb-1">Email Address</Text>
          {isEditing ? (
            <TextInput
              value={editedInfo.email}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, email: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800 mb-4"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text className="text-base text-gray-800 mb-4">{userInfo.email}</Text>
          )}
          
          <Text className="text-sm text-gray-500 mb-1">Phone Number</Text>
          {isEditing ? (
            <TextInput
              value={editedInfo.phone}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, phone: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800 mb-4"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text className="text-base text-gray-800 mb-4">{userInfo.phone}</Text>
          )}
          
          <Text className="text-sm text-gray-500 mb-1">Date of Birth</Text>
          {isEditing ? (
            <TextInput
              value={editedInfo.dateOfBirth}
              onChangeText={(text) => setEditedInfo({ ...editedInfo, dateOfBirth: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800 mb-4"
              placeholder="DD/MM/YYYY"
            />
          ) : (
            <Text className="text-base text-gray-800 mb-4">{userInfo.dateOfBirth}</Text>
          )}
          
          <Text className="text-sm text-gray-500 mb-1">Gender</Text>
          {isEditing ? (
            <View className="flex-row mb-4">
              <TouchableOpacity 
                className={`flex-1 p-3 border rounded-lg mr-2 ${editedInfo.gender === 'Male' ? 'bg-[#FFBF00] border-[#FFBF00]' : 'border-gray-300'}`}
                onPress={() => setEditedInfo({ ...editedInfo, gender: 'Male' })}
              >
                <Text className={`text-center ${editedInfo.gender === 'Male' ? 'text-white' : 'text-gray-700'}`}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 p-3 border rounded-lg ml-2 ${editedInfo.gender === 'Female' ? 'bg-[#FFBF00] border-[#FFBF00]' : 'border-gray-300'}`}
                onPress={() => setEditedInfo({ ...editedInfo, gender: 'Female' })}
              >
                <Text className={`text-center ${editedInfo.gender === 'Female' ? 'text-white' : 'text-gray-700'}`}>Female</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-base text-gray-800 mb-4">{userInfo.gender}</Text>
          )}
        </View>
        
        {/* Privacy Note */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" className="mt-0.5" />
            <Text className="text-sm text-blue-800 ml-2 flex-1">
              Your personal information is secure and will only be used to enhance your shopping experience. 
              See our Privacy Policy for more details.
            </Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        {isEditing && (
          <View className="flex-row mt-4 mb-8">
            <TouchableOpacity 
              onPress={handleCancel}
              className="flex-1 py-3 bg-gray-200 rounded-lg mr-2"
            >
              <Text className="text-gray-800 font-medium text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave}
              className="flex-1 py-3 bg-[#FFBF00] rounded-lg ml-2"
            >
              <Text className="text-white font-medium text-center">Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformation;