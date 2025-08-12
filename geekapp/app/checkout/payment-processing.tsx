import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function PaymentProcessingScreen() {
  const router = useRouter();
  const { method, option, amount } = useLocalSearchParams();
  const { clearCart } = useCart();
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Simulate payment processing
    const timer = setTimeout(() => {
      // Clear cart after successful payment
      clearCart();
      
      // Navigate to success screen
      router.replace({
        pathname: '/checkout/order-success',
        params: {
          method,
          option,
          amount,
          orderId: `ORD${Date.now()}`,
        }
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const getPaymentMethodTitle = () => {
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
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <View className="flex-1 justify-center items-center px-8">
        {/* Processing Animation */}
        <View className="w-32 h-32 rounded-full bg-yellow-100 items-center justify-center mb-8">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>

        {/* Processing Text */}
        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
          Processing Payment
        </Text>
        
        <Text className="text-gray-600 text-center mb-2">
          Please wait while we process your payment
        </Text>
        
        <Text className="text-gray-600 text-center mb-8">
          via {getPaymentMethodTitle()}
          {option && option !== 'undefined' && ` - ${option}`}
        </Text>

        {/* Progress Bar */}
        <View className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <Animated.View
            className="bg-yellow-500 h-2 rounded-full"
            style={{
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>

        {/* Amount */}
        <View className="bg-gray-50 p-4 rounded-xl w-full">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Amount to be paid</Text>
            <Text className="text-2xl font-bold text-gray-800">${amount}</Text>
          </View>
        </View>

        {/* Security Note */}
        <Text className="text-xs text-gray-500 text-center mt-8">
          🔒 Your payment is secured with 256-bit SSL encryption
        </Text>
      </View>
    </SafeAreaView>
  );
}