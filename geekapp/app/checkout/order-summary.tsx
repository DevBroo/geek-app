import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart, CartItem } from '../../context/CartContext';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { addressId } = useLocalSearchParams();
  const { cartItems } = useCart();

  // Mock address data (in real app, fetch based on addressId)
  const selectedAddress = {
    id: addressId,
    name: 'John Doe',
    phone: '+91 9876543210',
    addressLine1: '123 Main Street, Apartment 4B',
    addressLine2: 'Near Central Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    type: 'Home',
  };

  // Calculate pricing
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.originalPrice * (1 - item.discountPercentage / 100) * item.quantity), 
    0
  );
  const discount = cartItems.reduce(
    (total, item) => total + ((item.originalPrice * item.discountPercentage / 100) * item.quantity), 
    0
  );
  const deliveryCharges = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.0825;
  const total = subtotal + deliveryCharges + tax;

  const handleContinue = () => {
    router.push('/checkout/payment-method');
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.originalPrice * (1 - item.discountPercentage / 100);
    
    return (
      <View className="flex-row p-4 bg-white rounded-xl mb-3 shadow-sm">
        <Image 
          source={item.image} 
          style={{ width: 60, height: 60, resizeMode: 'contain' }} 
        />
        
        <View className="flex-1 ml-3">
          <Text className="font-semibold text-base text-gray-800" numberOfLines={2}>
            {item.title}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 line-through text-sm">
              ${item.originalPrice.toFixed(2)}
            </Text>
            <Text className="ml-2 font-bold text-green-600">
              ${discountedPrice.toFixed(2)}
            </Text>
            <View className="bg-red-500 px-2 py-1 rounded ml-2">
              <Text className="text-white text-xs font-medium">
                {item.discountPercentage}% OFF
              </Text>
            </View>
          </View>
          
          <Text className="text-gray-600 mt-1">Qty: {item.quantity}</Text>
        </View>
        
        <View className="items-end justify-center">
          <Text className="font-bold text-lg text-gray-800">
            ${(discountedPrice * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Order Summary</Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="flex-row items-center justify-center py-4 bg-white">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
          <View className="w-12 h-1 bg-yellow-500 mx-2" />
          <View className="w-8 h-8 rounded-full bg-yellow-500 items-center justify-center">
            <Text className="text-white font-bold text-sm">2</Text>
          </View>
          <View className="w-12 h-1 bg-gray-300 mx-2" />
          <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
            <Text className="text-gray-600 font-bold text-sm">3</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Delivery Address</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-yellow-600 font-medium">Change</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-start">
            <Ionicons name="location" size={20} color="#F59E0B" />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="font-semibold text-gray-800">{selectedAddress.name}</Text>
                <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                  <Text className="text-xs font-medium text-green-700">
                    {selectedAddress.type}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600 mb-1">{selectedAddress.phone}</Text>
              <Text className="text-gray-700">
                {selectedAddress.addressLine1}
                {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
              </Text>
              <Text className="text-gray-700">
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Order Items ({cartItems.length})
          </Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Price Breakdown */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Price Details</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</Text>
              <Text className="font-medium">${(subtotal + discount).toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-green-600">Discount</Text>
              <Text className="font-medium text-green-600">-${discount.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Charges</Text>
              <Text className="font-medium">
                {deliveryCharges === 0 ? (
                  <Text className="text-green-600">Free</Text>
                ) : (
                  `$${deliveryCharges.toFixed(2)}`
                )}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Tax</Text>
              <Text className="font-medium">${tax.toFixed(2)}</Text>
            </View>
            
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total Amount</Text>
                <Text className="text-lg font-bold text-gray-800">${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View className="bg-white mx-4 mt-4 mb-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">Delivery Information</Text>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text className="ml-3 text-gray-700">Expected delivery in 3-5 business days</Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
            <Text className="ml-3 text-gray-700">Safe and secure packaging</Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-yellow-500 py-4 rounded-xl"
          onPress={handleContinue}
        >
          <Text className="text-white font-bold text-center text-lg">
            Continue to Payment
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}