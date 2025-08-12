import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';

interface PaymentMethod {
  id: string;
  type: 'card' | 'netbanking' | 'wallet' | 'cod' | 'upi';
  title: string;
  icon: string;
  options?: string[];
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
}

export default function PaymentMethodScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [expandedMethod, setExpandedMethod] = useState<string>('');

  // Calculate total
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.originalPrice * (1 - item.discountPercentage / 100) * item.quantity), 
    0
  );
  const deliveryCharges = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.0825;
  const total = subtotal + deliveryCharges + tax;

  // Mock saved cards
  const savedCards: SavedCard[] = [
    { id: '1', last4: '4532', brand: 'Visa', expiryMonth: '12', expiryYear: '25' },
    { id: '2', last4: '8765', brand: 'Mastercard', expiryMonth: '08', expiryYear: '26' },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      title: 'Credit/Debit Card',
      icon: 'card-outline',
      options: ['Add New Card', ...savedCards.map(card => `${card.brand} ending in ${card.last4}`)],
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      title: 'Net Banking',
      icon: 'business-outline',
      options: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Other Banks'],
    },
    {
      id: 'wallet',
      type: 'wallet',
      title: 'Digital Wallet',
      icon: 'wallet-outline',
      options: ['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay', 'Mobikwik'],
    },
    {
      id: 'upi',
      type: 'upi',
      title: 'UPI/BHIM',
      icon: 'phone-portrait-outline',
      options: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'Other UPI Apps'],
    },
    {
      id: 'cod',
      type: 'cod',
      title: 'Cash on Delivery',
      icon: 'cash-outline',
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setExpandedMethod(expandedMethod === methodId ? '' : methodId);
    setSelectedOption('');
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleMakePayment = () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue.');
      return;
    }

    if (selectedMethod !== 'cod' && !selectedOption) {
      Alert.alert('Select Option', 'Please select a payment option to continue.');
      return;
    }

    // Navigate to payment processing
    router.push({
      pathname: '/checkout/payment-processing',
      params: {
        method: selectedMethod,
        option: selectedOption,
        amount: total.toFixed(2),
      }
    });
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;
    const isExpanded = expandedMethod === method.id;

    return (
      <View key={method.id} className="mb-3">
        <TouchableOpacity
          className={`p-4 rounded-xl border-2 ${
            isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white'
          }`}
          onPress={() => handleMethodSelect(method.id)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={isSelected ? '#F59E0B' : '#6B7280'} 
              />
              <Text className={`ml-3 font-semibold text-base ${
                isSelected ? 'text-yellow-700' : 'text-gray-800'
              }`}>
                {method.title}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              {method.type === 'cod' && (
                <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                  <Text className="text-green-700 text-xs font-medium">No Extra Charges</Text>
                </View>
              )}
              <View className={`w-5 h-5 rounded-full border-2 ${
                isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
              } items-center justify-center`}>
                {isSelected && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Options Dropdown */}
        {isExpanded && method.options && (
          <View className="mt-2 ml-4 mr-4">
            {method.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`p-3 rounded-lg border mb-2 ${
                  selectedOption === option
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
                onPress={() => handleOptionSelect(option)}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`font-medium ${
                    selectedOption === option ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    {option}
                  </Text>
                  <View className={`w-4 h-4 rounded-full border-2 ${
                    selectedOption === option
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300'
                  } items-center justify-center`}>
                    {selectedOption === option && (
                      <Ionicons name="checkmark" size={8} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
          <Text className="text-xl font-bold text-gray-800">Payment Method</Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="flex-row items-center justify-center py-4 bg-white">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
          <View className="w-12 h-1 bg-green-500 mx-2" />
          <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
          <View className="w-12 h-1 bg-yellow-500 mx-2" />
          <View className="w-8 h-8 rounded-full bg-yellow-500 items-center justify-center">
            <Text className="text-white font-bold text-sm">3</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <Text className="text-lg font-bold text-gray-800 mb-4">Choose Payment Method</Text>
        
        {paymentMethods.map(renderPaymentMethod)}

        {/* Security Info */}
        <View className="bg-blue-50 p-4 rounded-xl mt-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text className="ml-2 font-semibold text-blue-800">Secure Payment</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            Your payment information is encrypted and secure. We never store your card details.
          </Text>
        </View>

        {/* Payment Info */}
        <View className="bg-white p-4 rounded-xl mt-6 ">
            <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text className="ml-2 font-semibold text-gray-700">Payment Information</Text>
            </View>
            <View className="flex-row items-center mb-2">
                <Ionicons name="radio-button-on" size={16} color="#F59E0B" className='mb-'  />
                <Text className="text-sm text-gray-700 ">
                    Please select a payment method to proceed with your order. If you choose Cash on Delivery (COD), you will need to pay 10% of the total amount in advance. The remaining balance will be paid at the time of delivery.
                </Text>
            </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-800">Total Amount</Text>
          <Text className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          className={`py-4 rounded-xl ${
            selectedMethod && (selectedMethod === 'cod' || selectedOption)
              ? 'bg-yellow-500' 
              : 'bg-gray-300'
          }`}
          onPress={handleMakePayment}
          disabled={!selectedMethod || (selectedMethod !== 'cod' && !selectedOption)}
        >
          <Text className={`text-center font-bold text-lg ${
            selectedMethod && (selectedMethod === 'cod' || selectedOption)
              ? 'text-white' 
              : 'text-gray-500'
          }`}>
            {selectedMethod === 'cod' ? 'Place Order' : 'Make Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}