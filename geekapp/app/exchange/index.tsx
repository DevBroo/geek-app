import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Ionicons from "@expo/vector-icons/Ionicons";

// Define interfaces for our data types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any; // This would be a proper image source in a real app
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'received' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

// Define interface for payment methods
interface PaymentMethod {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap; // This ensures icon names are valid Ionicons names
  details: string;
}

const ExchangeScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Sample order data (in a real app, this would come from a context or API)
  const order: Order = {
    id: '1',
    orderNumber: 'ORD-2023-001',
    date: '2023-05-15',
    status: 'delivered',
    items: [
      { 
        id: '1', 
        name: 'Laptop Pro', 
        price: 1299.99, 
        quantity: 1,
        image: require('../../assets/images/mouse1.jpg') // Placeholder image
      },
      { 
        id: '2', 
        name: 'Wireless Mouse', 
        price: 49.99, 
        quantity: 1,
        image: require('../../assets/images/mouse1.jpg') // Placeholder image
      }
    ],
    total: 1349.98
  };

  // Handle item selection for exchange
  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Handle navigation between steps
  const goToNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit exchange request
      handleSubmitExchange();
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  // Handle exchange submission
  const handleSubmitExchange = () => {
    // Here you would typically send the exchange request to your backend
    // For now, we'll just show a success message and navigate back
    alert('Exchange request submitted successfully!');
    router.back();
  };

  // Render step 1: Select items to exchange
  const renderStep1 = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Select Items to Exchange</Text>
      
      {order.items.map(item => (
        <TouchableOpacity 
          key={item.id}
          className={`flex-row items-center p-4 mb-4 border rounded-lg ${
            selectedItems.includes(item.id) ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
          }`}
          onPress={() => toggleItemSelection(item.id)}
        >
          <Image 
            source={item.image} 
            className="w-20 h-20 rounded-md mr-4"
            resizeMode="contain"
          />
          
          <View className="flex-1">
            <Text className="font-semibold text-base">{item.name}</Text>
            <Text className="text-gray-500">Qty: {item.quantity}</Text>
            <Text className="font-bold mt-1">${item.price.toFixed(2)}</Text>
          </View>
          
          <View className={`w-6 h-6 rounded-full border ${
            selectedItems.includes(item.id) 
              ? 'bg-yellow-500 border-yellow-500' 
              : 'border-gray-400'
          } justify-center items-center`}>
            {selectedItems.includes(item.id) && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render step 2: Reason for exchange
  const renderStep2 = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Reason for Exchange</Text>
      
      <View className="mb-6">
        {[
          { id: 'defective', label: 'Product is defective/damaged' },
          { id: 'wrong_item', label: 'Received wrong item' },
          { id: 'not_as_described', label: 'Product not as described' },
          { id: 'size_issue', label: 'Size/fit issue' },
          { id: 'changed_mind', label: 'Changed my mind' }
        ].map(reason => (
          <TouchableOpacity 
            key={reason.id}
            className={`flex-row items-center p-4 mb-3 border rounded-lg ${
              returnReason === reason.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
            }`}
            onPress={() => setReturnReason(reason.id)}
          >
            <View className={`w-6 h-6 rounded-full border ${
              returnReason === reason.id 
                ? 'bg-yellow-500 border-yellow-500' 
                : 'border-gray-400'
            } justify-center items-center mr-3`}>
              {returnReason === reason.id && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text className="text-gray-800">{reason.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text className="font-semibold mb-2">Additional Comments</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-4 h-32 text-gray-800 mb-4"
        placeholder="Please provide more details about your exchange request..."
        multiline
        textAlignVertical="top"
        value={additionalComments}
        onChangeText={setAdditionalComments}
      />
    </ScrollView>
  );

  // Render step 3: Refund details
  const renderStep3 = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Refund Details</Text>
      
      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <Text className="font-semibold mb-2">Pickup Address</Text>
        <Text className="text-gray-700">123 Main Street, Apt 4B</Text>
        <Text className="text-gray-700">New York, NY 10001</Text>
        <Text className="text-gray-700">United States</Text>
        
        <TouchableOpacity className="mt-2">
          <Text className="text-yellow-600 font-semibold">Change Address</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="font-semibold mb-3">Select Refund Method</Text>
      <View className="mb-6">
        {([
          { id: 'original', label: 'Original Payment Method', icon: 'card-outline', details: 'Visa •••• 4242' },
          { id: 'wallet', label: 'Store Credit/Wallet', icon: 'wallet-outline', details: 'Balance: $0.00' }
        ] as PaymentMethod[]).map(method => (
          <TouchableOpacity 
            key={method.id}
            className={`flex-row items-center p-4 mb-3 border rounded-lg ${
              selectedPaymentMethod === method.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
            }`}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons 
              name={method.icon} 
              size={24} 
              color={selectedPaymentMethod === method.id ? "#F59E0B" : "#6B7280"} 
              style={{ marginRight: 12 }}
            />
            
            <View className="flex-1">
              <Text className="font-semibold">{method.label}</Text>
              <Text className="text-gray-500 text-xs">{method.details}</Text>
            </View>
            
            <View className={`w-6 h-6 rounded-full border ${
              selectedPaymentMethod === method.id 
                ? 'bg-yellow-500 border-yellow-500' 
                : 'border-gray-400'
            } justify-center items-center`}>
              {selectedPaymentMethod === method.id && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="font-semibold mb-3">Exchange Summary</Text>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-700">Items to Exchange:</Text>
          <Text className="font-semibold">{selectedItems.length}</Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-700">Total Refund Amount:</Text>
          <Text className="font-semibold">${
            order.items
              .filter(item => selectedItems.includes(item.id))
              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
              .toFixed(2)
          }</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-700">Estimated Processing Time:</Text>
          <Text className="font-semibold">3-5 business days</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="p-2"
            onPress={goToPreviousStep}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">Exchange Products</Text>
        </View>
      </View>
      
      {/* Progress indicator */}
      <View className="px-8 py-4 bg-white">
        <View className="flex-row justify-between mb-2">
          {[1, 2, 3].map(stepNumber => (
            <View key={stepNumber} className="items-center">
              <View className={`w-10 h-10 rounded-full ${
                step >= stepNumber ? 'bg-yellow-500' : 'bg-gray-300'
              } justify-center items-center`}>
                <Text className="text-white font-bold">{stepNumber}</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">
                {stepNumber === 1 ? 'Select Items' : 
                 stepNumber === 2 ? 'Reason' : 'Refund'}
              </Text>
            </View>
          ))}
          
          {/* Connecting lines */}
          <View className={`h-0.5 absolute top-7 left-16 right-16 ${
            step > 1 ? 'bg-yellow-500' : 'bg-gray-300'
          }`} />
          <View className={`h-0.5 absolute top-7 right-16 left-1/2 ${
            step > 2 ? 'bg-yellow-500' : 'bg-gray-300'
          }`} />
        </View>
      </View>
      
      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      
      {/* Bottom navigation */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <View className="flex-row justify-between">
          <TouchableOpacity 
            className="flex-1 border border-gray-300 rounded-lg py-3 mr-2"
            onPress={goToPreviousStep}
          >
            <Text className="text-center font-semibold text-gray-700">
              {step === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 rounded-lg py-3 ml-2 ${
              (step === 1 && selectedItems.length === 0) ||
              (step === 2 && !returnReason) ||
              (step === 3 && !selectedPaymentMethod)
                ? 'bg-gray-300' : 'bg-yellow-500'
            }`}
            onPress={goToNextStep}
            disabled={
              (step === 1 && selectedItems.length === 0) ||
              (step === 2 && !returnReason) ||
              (step === 3 && !selectedPaymentMethod)
            }
          >
            <Text className="text-center font-semibold text-white">
              {step < 3 ? 'Next' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ExchangeScreen;