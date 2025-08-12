import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

// Define interfaces for our data types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'received' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

interface OrderActionTabsProps {
  order: Order;
  onOrderStatusChange?: (orderId: string, newStatus: string) => void;
}

type TabType = 'track' | 'cancel' | 'exchange';

const OrderActionTabs: React.FC<OrderActionTabsProps> = ({ order, onOrderStatusChange }) => {
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [exchangeStep, setExchangeStep] = useState(1);
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [trackingExpanded, setTrackingExpanded] = useState(false);

  // Determine which tabs to show based on order status
  const showTrackTab = order.status !== 'cancelled';
  const showCancelTab = order.status === 'received' || order.status === 'processing';
  const showExchangeTab = order.status !== 'cancelled';

  // Handle tab press
  const handleTabPress = (tab: TabType) => {
    if (tab === 'track') {
      // Toggle tracking view when track tab is pressed
      if (activeTab === 'track') {
        setActiveTab(null);
        setTrackingExpanded(false);
      } else {
        setActiveTab(tab);
        setTrackingExpanded(true);
      }
    } else {
      setActiveTab(tab);
      
      if (tab === 'cancel') {
        // If cancel tab is pressed, show the cancel confirmation modal
        setCancelModalVisible(true);
      } else if (tab === 'exchange') {
        // Show the exchange modal instead of navigating
        setExchangeModalVisible(true);
        setExchangeStep(1);
      }
    }
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: () => {
            // Call the callback to update order status
            if (onOrderStatusChange) {
              onOrderStatusChange(order.id, 'cancelled');
            }
            setCancelModalVisible(false);
            // Show success message
            Alert.alert(
              "Order Cancelled",
              "Your order has been cancelled successfully.",
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  // Handle item selection for exchange
  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Handle exchange step navigation
  const goToNextExchangeStep = () => {
    if (exchangeStep < 3) {
      setExchangeStep(exchangeStep + 1);
    } else {
      // Submit exchange request
      handleSubmitExchange();
    }
  };

  const goToPreviousExchangeStep = () => {
    if (exchangeStep > 1) {
      setExchangeStep(exchangeStep - 1);
    } else {
      setExchangeModalVisible(false);
    }
  };
  
  // Get step title based on current step
  const getExchangeStepTitle = () => {
    switch(exchangeStep) {
      case 1: return "Select Items";
      case 2: return "Reason for Exchange";
      case 3: return "Refund Details";
      default: return "Exchange Items";
    }
  };

  // Handle exchange submission
  const handleSubmitExchange = () => {
    // Here you would typically send the exchange request to your backend
    // For now, we'll just show a success message
    setExchangeModalVisible(false);
    Alert.alert(
      "Exchange Request Submitted",
      "Your exchange request has been submitted successfully. We will process it shortly.",
      [{ text: "OK" }]
    );
  };

  // Render the Track Order tab content
  const renderTrackOrderTab = () => {
    // Define the order tracking steps
    const trackingSteps = [
      { id: 'confirmed', label: 'Order Confirmed', completed: true, icon: 'checkmark-circle' },
      { id: 'shipped', label: 'Order Shipped', completed: order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered', icon: 'cube' },
      { id: 'out_for_delivery', label: 'Out for Delivery', completed: order.status === 'out_for_delivery' || order.status === 'delivered', icon: 'car' },
      { id: 'delivered', label: 'Order Delivered', completed: order.status === 'delivered', icon: 'home' }
    ];

    return (
      <View className="p-6 bg-white shadow-md border-t border-gray-100">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Ionicons name="navigate-circle" size={24} color="#F59E0B" />
            <Text className="text-lg font-bold ml-3 text-gray-800">Tracking Details</Text>
          </View>
          <View className="bg-yellow-100 px-3 py-1.5 rounded-full">
            <Text className="text-yellow-800 font-medium text-xs">#{order.orderNumber}</Text>
          </View>
        </View>
        
        <View className="bg-gray-50 p-5 rounded-xl mb-8">
          <Text className="text-gray-500 text-sm mb-2">Estimated Delivery</Text>
          <Text className="text-gray-800 font-bold text-lg">
            {order.status === 'delivered' ? 'Delivered' : 'Expected by May 15, 2023'}
          </Text>
        </View>
        
        <View className="space-y-6">
          {trackingSteps.map((step, index) => (
            <View key={step.id} className="flex-row items-start">
              {/* Left side with icon and line */}
              <View className="items-center">
                <View className={`w-12 h-12 rounded-full justify-center items-center ${
                  step.completed ? 'bg-yellow-500' : 'bg-gray-200'
                }`}>
                  <Ionicons 
                    name={step.completed ? step.icon as any : 'ellipse-outline'} 
                    size={22} 
                    color={step.completed ? "white" : "#9CA3AF"} 
                  />
                </View>
                
                {/* Connecting line */}
                {index < trackingSteps.length + 1 && (
                  <View 
                    className={`h-16 w-1.5 mx-auto mt-1 ${
                      step.completed ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} 
                    style={{ marginBottom: -4 }}
                  />
                )}
              </View>
              
              {/* Step details */}
              <View className="ml-4 flex-1 pb-6 pt-1">
                <Text className={`font-bold text-lg ${
                  step.completed ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step.label}
                </Text>
                
                <Text className={`text-sm mt-2 ${
                  step.completed ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.id === 'confirmed' ? 'Your order has been confirmed and is being processed' : 
                   step.id === 'shipped' ? 'Your order has been shipped and is on the way' :
                   step.id === 'out_for_delivery' ? 'Your order is out for delivery and will arrive soon' :
                   'Your order has been delivered successfully to your address'}
                </Text>
                
                {step.completed && (
                  <View className="mt-3 bg-gray-100 px-4 py-2.5 rounded-lg">
                    <Text className="text-xs text-gray-600 font-medium">
                      {step.id === 'confirmed' ? 'May 10, 2023 • 10:30 AM' : 
                       step.id === 'shipped' ? 'May 12, 2023 • 2:15 PM' :
                       step.id === 'out_for_delivery' ? 'May 14, 2023 • 9:45 AM' :
                       'May 15, 2023 • 3:20 PM'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render the Cancel Order tab content (modal)
  const renderCancelOrderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={cancelModalVisible}
      onRequestClose={() => setCancelModalVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold">Cancel Order</Text>
            <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-base text-gray-700 mb-6">
            Are you sure you want to cancel this order? This action cannot be undone.
          </Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 border border-gray-300 rounded-lg py-3 mr-2"
              onPress={() => setCancelModalVisible(false)}
            >
              <Text className="text-center font-semibold text-gray-700">No, Keep Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-red-500 rounded-lg py-3 ml-2"
              onPress={handleCancelOrder}
            >
              <Text className="text-center font-semibold text-white">Yes, Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render the Exchange Product tab content (multi-step modal)
  const renderExchangeModal = () => {
    const renderStep1 = () => (
      <>
        <Text className="text-base text-gray-600 mb-4">
          Please select the items you would like to exchange from your order.
        </Text>
        <ScrollView className="max-h-80">
          {order.items.map(item => (
            <TouchableOpacity 
              key={item.id}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
                selectedItems.includes(item.id) ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50 border border-gray-100'
              }`}
              onPress={() => toggleItemSelection(item.id)}
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-lg bg-white border border-gray-200 mr-3 items-center justify-center`}>
                  <Ionicons name="cube-outline" size={24} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{item.name}</Text>
                  <View className="flex-row mt-1">
                    <Text className="text-gray-500 text-xs">Qty: {item.quantity}</Text>
                    <Text className="text-gray-500 text-xs mx-2">•</Text>
                    <Text className="text-gray-500 text-xs">${item.price.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
              <View className={`w-6 h-6 rounded-full border ${
                selectedItems.includes(item.id) 
                  ? 'bg-yellow-500 border-yellow-500' 
                  : 'border-gray-300'
              } justify-center items-center`}>
                {selectedItems.includes(item.id) && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {selectedItems.length > 0 && (
          <View className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <Text className="text-yellow-800 font-medium">
              {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected for exchange
            </Text>
          </View>
        )}
      </>
    );

    const renderStep2 = () => (
      <>
        <Text className="text-lg font-bold mb-4">Reason for Exchange</Text>
        <View className="mb-4">
          {[
            { id: 'defective', label: 'Product is defective/damaged' },
            { id: 'wrong_item', label: 'Received wrong item' },
            { id: 'not_as_described', label: 'Product not as described' },
            { id: 'size_issue', label: 'Size/fit issue' },
            { id: 'changed_mind', label: 'Changed my mind' }
          ].map(reason => (
            <TouchableOpacity 
              key={reason.id}
              className={`flex-row items-center p-3 mb-2 border rounded-lg ${
                returnReason === reason.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
              }`}
              onPress={() => setReturnReason(reason.id)}
            >
              <View className={`w-5 h-5 rounded-full border ${
                returnReason === reason.id 
                  ? 'bg-yellow-500 border-yellow-500' 
                  : 'border-gray-400'
              } mr-3`}>
                {returnReason === reason.id && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-gray-800">{reason.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text className="font-semibold mb-2">Additional Comments</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 h-24 text-gray-800"
          placeholder="Please provide more details about your exchange request..."
          multiline
          value={additionalComments}
          onChangeText={setAdditionalComments}
        />
      </>
    );

    const renderStep3 = () => (
      <>
        <Text className="text-lg font-bold mb-4">Refund Details</Text>
        
        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="font-semibold mb-2">Pickup Address</Text>
          <Text className="text-gray-700">123 Main Street, Apt 4B</Text>
          <Text className="text-gray-700">New York, NY 10001</Text>
          <Text className="text-gray-700">United States</Text>
        </View>
        
        <Text className="font-semibold mb-2">Select Refund Method</Text>
        <View className="mb-4">
          {[
            { id: 'original', label: 'Original Payment Method', icon: 'card-outline' as const },
            { id: 'wallet', label: 'Store Credit/Wallet', icon: 'wallet-outline' as const }
          ].map(method => (
            <TouchableOpacity 
              key={method.id}
              className={`flex-row items-center p-4 mb-2 border rounded-lg ${
                selectedPaymentMethod === method.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
              }`}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <Ionicons name={method.icon} size={24} color={selectedPaymentMethod === method.id ? "#F59E0B" : "#6B7280"} />
              <View className="ml-3 flex-1">
                <Text className="font-semibold">{method.label}</Text>
                <Text className="text-gray-500 text-xs">
                  {method.id === 'original' 
                    ? 'Refund will be processed to your original payment method'
                    : 'Amount will be added to your store wallet'}
                </Text>
              </View>
              <View className={`w-5 h-5 rounded-full border ${
                selectedPaymentMethod === method.id 
                  ? 'bg-yellow-500 border-yellow-500' 
                  : 'border-gray-400'
              }`}>
                {selectedPaymentMethod === method.id && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View className="bg-gray-100 p-4 rounded-lg">
          <Text className="font-semibold mb-2">Exchange Summary</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">Items to Exchange:</Text>
            <Text className="font-semibold">{selectedItems.length}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Total Refund Amount:</Text>
            <Text className="font-semibold">${
              order.items
                .filter(item => selectedItems.includes(item.id))
                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                .toFixed(2)
            }</Text>
          </View>
        </View>
      </>
    );

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={exchangeModalVisible}
        onRequestClose={() => setExchangeModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Header with back button and title */}
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity 
                onPress={goToPreviousExchangeStep}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                {exchangeStep > 1 ? (
                  <Ionicons name="arrow-back" size={20} color="#4B5563" />
                ) : (
                  <Ionicons name="close" size={20} color="#4B5563" />
                )}
              </TouchableOpacity>
              <View>
                <Text className="text-lg font-bold text-center text-gray-800">
                  {getExchangeStepTitle()}
                </Text>
                <Text className="text-xs text-gray-500 text-center">
                  Step {exchangeStep} of 3
                </Text>
              </View>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Progress bar */}
            <View className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
              <View 
                className="h-full bg-yellow-500 rounded-full" 
                style={{ width: `${(exchangeStep / 3) * 100}%` }} 
              />
            </View>
            
            {/* Step indicators */}
            <View className="flex-row justify-between mb-6 px-2">
              {[1, 2, 3].map(step => (
                <View key={step} className="items-center">
                  <View className={`w-8 h-8 rounded-full justify-center items-center ${
                    exchangeStep === step 
                      ? 'bg-yellow-500 border-2 border-yellow-200' 
                      : exchangeStep > step 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-200'
                  }`}>
                    {exchangeStep > step ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text className={`text-sm font-bold ${exchangeStep === step ? 'text-white' : 'text-gray-500'}`}>
                        {step}
                      </Text>
                    )}
                  </View>
                  <Text className={`text-xs mt-1 ${
                    exchangeStep >= step ? 'text-gray-800 font-medium' : 'text-gray-400'
                  }`}>
                    {step === 1 ? 'Select' : step === 2 ? 'Reason' : 'Refund'}
                  </Text>
                </View>
              ))}
              
              {/* Connecting lines */}
              <View className="absolute top-4 left-12 w-[30%] h-0.5 bg-gray-200">
                <View 
                  className="absolute top-0 left-0 h-full bg-yellow-500" 
                  style={{ width: exchangeStep > 1 ? '100%' : '0%' }} 
                />
              </View>
              <View className="absolute top-4 right-12 w-[30%] h-0.5 bg-gray-200">
                <View 
                  className="absolute top-0 left-0 h-full bg-yellow-500" 
                  style={{ width: exchangeStep > 2 ? '100%' : '0%' }} 
                />
              </View>
            </View>
            
            {/* Step content */}
            <ScrollView className="mb-6">
              {exchangeStep === 1 && renderStep1()}
              {exchangeStep === 2 && renderStep2()}
              {exchangeStep === 3 && renderStep3()}
            </ScrollView>
            
            {/* Navigation buttons */}
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 rounded-xl py-4 mr-2 flex-row justify-center items-center"
                onPress={goToPreviousExchangeStep}
              >
                {exchangeStep > 1 && (
                  <Ionicons name="arrow-back" size={18} color="#4B5563" style={{ marginRight: 8 }} />
                )}
                <Text className="font-semibold text-gray-700">
                  {exchangeStep === 1 ? 'Cancel' : 'Back'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 rounded-xl py-4 ml-2 flex-row justify-center items-center ${
                  (exchangeStep === 1 && selectedItems.length === 0) ||
                  (exchangeStep === 2 && !returnReason) ||
                  (exchangeStep === 3 && !selectedPaymentMethod)
                    ? 'bg-gray-300' : 'bg-yellow-500'
                }`}
                onPress={goToNextExchangeStep}
                disabled={
                  (exchangeStep === 1 && selectedItems.length === 0) ||
                  (exchangeStep === 2 && !returnReason) ||
                  (exchangeStep === 3 && !selectedPaymentMethod)
                }
              >
                <Text className="font-semibold text-white">
                  {exchangeStep < 3 ? 'Continue' : 'Submit Request'}
                </Text>
                {exchangeStep < 3 && (
                  <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Define tab data for consistent rendering
  const tabs = [
    { id: 'track' as TabType, label: 'Track', fullLabel: 'Track Order', icon: 'navigate-circle-outline', show: showTrackTab },
    { id: 'cancel' as TabType, label: 'Cancel', fullLabel: 'Cancel Order', icon: 'close-circle-outline', show: showCancelTab },
    { id: 'exchange' as TabType, label: 'Exchange', fullLabel: 'Exchange Product', icon: 'repeat-outline', show: showExchangeTab }
  ];

  return (
    <>
      {/* Tab buttons - redesigned for consistency */}
      <View className="border-t border-gray-200 bg-white shadow-sm">
        <View className="flex-row justify-evenly">
          {tabs.filter(tab => tab.show).map((tab) => (
            <TouchableOpacity 
              key={tab.id}
              className={`py-4 flex-1 items-center`}
              onPress={() => handleTabPress(tab.id)}
            >
              <View className={`items-center ${activeTab === tab.id ? '' : 'opacity-80'}`}>
                <View className={`w-12 h-15 rounded-full items-center justify-center mb-2 ${
                  activeTab === tab.id ? 'bg-yellow-500' : 'bg-gray-100'
                }`}>
                  <Ionicons 
                    name={tab.icon as any} 
                    size={22} 
                    color={activeTab === tab.id ? "white" : "#6B7280"} 
                  />
                  {tab.id === 'track' && (
                    <View className="absolute bottom-0 right-0 top-2 ">
                      <Ionicons 
                        name={trackingExpanded ? "chevron-up-circle" : "chevron-down-circle"} 
                        size={14} 
                        color={activeTab === tab.id ? "white" : "#6B7280"} 
                      />
                    </View>
                  )}
                </View>
                <Text className={`text-sm font-medium text-center ${
                  activeTab === tab.id ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {tab.fullLabel}
                </Text>
              </View>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <View className="absolute bottom-0 left-[15%] right-[15%] h-1 bg-yellow-500 rounded-t-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Tab content */}
      {trackingExpanded && (
        <View 
          className="overflow-hidden bg-gray-50"
          style={{
            maxHeight: 1000, // Set a large max height for animation
          }}
        >
          {renderTrackOrderTab()}
        </View>
      )}
      
      {/* Modals */}
      {renderCancelOrderModal()}
      {renderExchangeModal()}
    </>
  );
};

export default OrderActionTabs;