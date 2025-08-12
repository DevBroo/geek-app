import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { method, option, amount, orderId } = useLocalSearchParams();
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    // Animate success icon
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock order details
  const orderDetails = {
    orderId: orderId as string,
    orderDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    orderTime: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    deliveryAddress: {
      name: 'John Doe',
      phone: '+91 9876543210',
      address: '123 Main Street, Apartment 4B, Near Central Mall',
      city: 'Mumbai, Maharashtra - 400001',
    },
    paymentMethod: getPaymentMethodTitle(),
    paymentOption: option as string,
    totalAmount: amount as string,
  };

  function getPaymentMethodTitle() {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Digital Wallet';
      case 'upi':
        return 'UPI/BHIM';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Payment';
    }
  }

  const handleTrackOrder = () => {
    // Navigate to order tracking screen (to be implemented)
    router.push(`/orders/track/${orderId}` as any);
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View className="items-center py-12">
          <Animated.View
            style={{ transform: [{ scale: scaleValue }] }}
            className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6"
          >
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
          </Animated.View>
          
          <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
            Order Placed Successfully!
          </Text>
          
          <Text className="text-gray-600 text-center px-8">
            Thank you for your purchase. Your order has been confirmed and will be delivered soon.
          </Text>
        </View>

        {/* Order Details Card */}
        <View className="mx-4 mb-6">
          <View className="bg-gray-50 p-4 rounded-xl">
            <Text className="text-lg font-bold text-gray-800 mb-4">Order Details</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Order ID</Text>
                <Text className="font-semibold text-gray-800">{orderDetails.orderId}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Order Date</Text>
                <Text className="font-semibold text-gray-800">
                  {orderDetails.orderDate} at {orderDetails.orderTime}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Amount</Text>
                <Text className="font-bold text-green-600 text-lg">
                  ${orderDetails.totalAmount}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Method</Text>
                <Text className="font-semibold text-gray-800">
                  {orderDetails.paymentMethod}
                  {orderDetails.paymentOption && orderDetails.paymentOption !== 'undefined' && 
                    ` - ${orderDetails.paymentOption}`
                  }
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Expected Delivery</Text>
                <Text className="font-semibold text-gray-800">{orderDetails.estimatedDelivery}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mx-4 mb-6">
          <View className="bg-gray-50 p-4 rounded-xl">
            <Text className="text-lg font-bold text-gray-800 mb-4">Delivery Address</Text>
            
            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-800 mb-1">
                  {orderDetails.deliveryAddress.name}
                </Text>
                <Text className="text-gray-600 mb-1">
                  {orderDetails.deliveryAddress.phone}
                </Text>
                <Text className="text-gray-700 mb-1">
                  {orderDetails.deliveryAddress.address}
                </Text>
                <Text className="text-gray-700">
                  {orderDetails.deliveryAddress.city}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View className="mx-4 mb-8">
          <View className="bg-blue-50 p-4 rounded-xl">
            <Text className="text-lg font-bold text-blue-800 mb-3">What's Next?</Text>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="ml-2 text-blue-700">Order confirmed and being prepared</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                <Text className="ml-2 text-blue-700">You'll receive updates via SMS and email</Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={16} color="#6B7280" />
                <Text className="ml-2 text-blue-700">Track your order in real-time</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-200">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-4 rounded-xl"
            onPress={handleTrackOrder}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="location-outline" size={20} color="#374151" />
              <Text className="ml-2 font-semibold text-gray-700">Track Order</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 bg-yellow-500 py-4 rounded-xl"
            onPress={handleContinueShopping}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="storefront-outline" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Continue Shopping</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}