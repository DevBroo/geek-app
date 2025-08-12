import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'Home' | 'Work' | 'Other';
}

export default function AddressSelectionScreen() {
  const router = useRouter();
  const { userPhone } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'John Doe',
      phone: userPhone || '+91 9876543210',
      addressLine1: '123 Main Street, Apartment 4B',
      addressLine2: 'Near Central Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
      type: 'Home',
    },
    {
      id: '2',
      name: 'John Doe',
      phone: userPhone || '+91 9876543210',
      addressLine1: '456 Business Park, Floor 5',
      addressLine2: 'Tech Hub Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400070',
      isDefault: false,
      type: 'Work',
    },
  ]);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: userPhone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home' as 'Home' | 'Work' | 'Other',
  });

  React.useEffect(() => {
    // Set default address as selected
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses]);

  const handleContinue = () => {
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please select a delivery address to continue.');
      return;
    }
    
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    router.push({
      pathname: '/checkout/order-summary',
      params: { addressId: selectedAddressId }
    });
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    setAddresses(prev => [...prev, address]);
    setNewAddress({
      name: '',
      phone: userPhone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'Home',
    });
    setShowAddAddressModal(false);
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      className={`p-4 m-2 rounded-xl border-2 ${
        selectedAddressId === item.id
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}
      onPress={() => setSelectedAddressId(item.id)}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-full ${
            item.type === 'Home' ? 'bg-green-100' : 
            item.type === 'Work' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Text className={`text-xs font-medium ${
              item.type === 'Home' ? 'text-green-700' : 
              item.type === 'Work' ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {item.type}
            </Text>
          </View>
          {item.isDefault && (
            <View className="ml-2 px-2 py-1 bg-yellow-100 rounded-full">
              <Text className="text-xs font-medium text-yellow-700">Default</Text>
            </View>
          )}
        </View>
        <View className={`w-5 h-5 rounded-full border-2 ${
          selectedAddressId === item.id
            ? 'border-yellow-500 bg-yellow-500'
            : 'border-gray-300'
        } items-center justify-center`}>
          {selectedAddressId === item.id && (
            <Ionicons name="checkmark" size={12} color="white" />
          )}
        </View>
      </View>

      <Text className="font-bold text-base text-gray-800 mb-1">{item.name}</Text>
      <Text className="text-gray-600 mb-1">{item.phone}</Text>
      <Text className="text-gray-700 mb-1">{item.addressLine1}</Text>
      {item.addressLine2 && (
        <Text className="text-gray-700 mb-1">{item.addressLine2}</Text>
      )}
      <Text className="text-gray-700">
        {item.city}, {item.state} - {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Select Address</Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="flex-row items-center justify-center py-4 bg-white">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-yellow-500 items-center justify-center">
            <Text className="text-white font-bold text-sm">1</Text>
          </View>
          <View className="w-12 h-1 bg-gray-300 mx-2" />
          <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
            <Text className="text-gray-600 font-bold text-sm">2</Text>
          </View>
          <View className="w-12 h-1 bg-gray-300 mx-2" />
          <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
            <Text className="text-gray-600 font-bold text-sm">3</Text>
          </View>
        </View>
      </View>

      {/* Address List */}
      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={(item) => item.id}
        className="flex-1 px-2"
        showsVerticalScrollIndicator={false}
      />

      {/* Add New Address Button */}
      <View className="p-4 bg-white">
        <TouchableOpacity
          className="flex-row items-center justify-center py-3 border-2 border-dashed border-yellow-500 rounded-xl mb-4"
          onPress={() => setShowAddAddressModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#F59E0B" />
          <Text className="ml-2 text-yellow-600 font-semibold">Add New Address</Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl ${
            selectedAddressId ? 'bg-yellow-500' : 'bg-gray-300'
          }`}
          onPress={handleContinue}
          disabled={!selectedAddressId}
        >
          <Text className={`text-center font-bold text-lg ${
            selectedAddressId ? 'text-white' : 'text-gray-500'
          }`}>
            Continue to Order Summary
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <Text className="text-xl font-bold">Add New Address</Text>
            <TouchableOpacity onPress={() => setShowAddAddressModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 p-4">
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Full Name *"
              value={newAddress.name}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, name: text }))}
            />

            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Phone Number *"
              value={newAddress.phone}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />

            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Address Line 1 *"
              value={newAddress.addressLine1}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine1: text }))}
              multiline
            />

            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Address Line 2 (Optional)"
              value={newAddress.addressLine2}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, addressLine2: text }))}
              multiline
            />

            <View className="flex-row space-x-2 mb-4">
              <TextInput
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
                placeholder="City *"
                value={newAddress.city}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
              />
              <TextInput
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
                placeholder="State *"
                value={newAddress.state}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
              />
            </View>

            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Pincode *"
              value={newAddress.pincode}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, pincode: text }))}
              keyboardType="numeric"
            />

            {/* Address Type Selection */}
            <Text className="text-base font-semibold mb-2">Address Type</Text>
            <View className="flex-row space-x-2 mb-6">
              {(['Home', 'Work', 'Other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 py-3 rounded-xl border ${
                    newAddress.type === type
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  onPress={() => setNewAddress(prev => ({ ...prev, type }))}
                >
                  <Text className={`text-center font-medium ${
                    newAddress.type === type ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-yellow-500 py-4 rounded-xl"
              onPress={handleAddAddress}
            >
              <Text className="text-white font-bold text-center text-lg">Add Address</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}