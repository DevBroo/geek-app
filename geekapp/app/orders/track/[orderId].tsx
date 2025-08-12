import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  // Mock tracking data
  const trackingSteps: TrackingStep[] = [
    {
      id: '1',
      title: 'Order Confirmed',
      description: 'Your order has been placed and confirmed',
      timestamp: 'Today, 2:30 PM',
      isCompleted: true,
      isActive: false,
    },
    {
      id: '2',
      title: 'Order Prepared',
      description: 'Your order is being prepared for shipment',
      timestamp: 'Today, 3:45 PM',
      isCompleted: true,
      isActive: false,
    },
    {
      id: '3',
      title: 'Shipped',
      description: 'Your order has been shipped and is on the way',
      isCompleted: false,
      isActive: true,
    },
    {
      id: '4',
      title: 'Out for Delivery',
      description: 'Your order is out for delivery',
      isCompleted: false,
      isActive: false,
    },
    {
      id: '5',
      title: 'Delivered',
      description: 'Your order has been delivered',
      isCompleted: false,
      isActive: false,
    },
  ];

  const renderTrackingStep = (step: TrackingStep, index: number) => {
    const isLast = index === trackingSteps.length - 1;

    return (
      <View key={step.id} className="flex-row">
        {/* Timeline */}
        <View className="items-center mr-4">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${
            step.isCompleted 
              ? 'bg-green-500' 
              : step.isActive 
                ? 'bg-yellow-500' 
                : 'bg-gray-300'
          }`}>
            {step.isCompleted ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : step.isActive ? (
              <View className="w-3 h-3 rounded-full bg-white" />
            ) : (
              <View className="w-3 h-3 rounded-full bg-gray-500" />
            )}
          </View>
          
          {!isLast && (
            <View className={`w-0.5 h-16 mt-2 ${
              step.isCompleted ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 pb-6">
          <Text className={`font-bold text-base ${
            step.isCompleted || step.isActive ? 'text-gray-800' : 'text-gray-500'
          }`}>
            {step.title}
          </Text>
          
          <Text className={`text-sm mt-1 ${
            step.isCompleted || step.isActive ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {step.description}
          </Text>
          
          {step.timestamp && (
            <Text className="text-xs text-gray-500 mt-1">{step.timestamp}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Track Order</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View className="bg-gray-50 p-4 rounded-xl mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-2">Order #{orderId}</Text>
          <Text className="text-gray-600">Expected delivery: Tomorrow, Dec 25</Text>
        </View>

        {/* Tracking Steps */}
        <View className="bg-white">
          <Text className="text-lg font-bold text-gray-800 mb-4">Order Status</Text>
          {trackingSteps.map(renderTrackingStep)}
        </View>

        {/* Delivery Info */}
        <View className="bg-blue-50 p-4 rounded-xl mt-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="ml-2 font-semibold text-blue-800">Delivery Information</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            Your order will be delivered between 10:00 AM - 6:00 PM. 
            You'll receive a call from our delivery partner 30 minutes before delivery.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-yellow-500 py-4 rounded-xl"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold text-center text-lg">
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}