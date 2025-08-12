import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import { useCart, CartItem } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const { 
    cartItems, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity, 
    clearCart 
  } = useCart();

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.originalPrice * (1 - item.discountPercentage / 100) * item.quantity), 
    0
  );

  // Calculate shipping (free over $50)
  const shipping = subtotal > 50 ? 0 : 5.99;
  
  // Calculate tax (8.25%)
  const tax = subtotal * 0.0825;
  
  // Calculate total
  const total = subtotal + shipping + tax;

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before checking out.');
      return;
    }
    
    // Navigate to address selection screen
    router.push('/checkout/address-selection');
  };

  // Render empty cart
  const renderEmptyCart = () => (
    <View className="flex-1 justify-center items-center p-4">
      <Ionicons name="cart-outline" size={80} color="#CCCCCC" />
      <Text className="text-lg font-semibold text-gray-800 mt-4">Your Cart is Empty</Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        Looks like you haven't added any products to your cart yet.
      </Text>
      <TouchableOpacity 
        className="bg-yellow-500 px-6 py-3 rounded-full mt-6"
        onPress={() => router.push('/')}
      >
        <Text className="text-white font-bold">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Render cart item
  const renderCartItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.originalPrice * (1 - item.discountPercentage / 100);
    
    return (
      <View className="flex-row p-4 border-b border-gray-200">
        {/* Product Image */}
        <Image 
          source={item.image} 
          style={{ width: 80, height: 80, resizeMode: 'contain' }} 
        />
        
        {/* Product Details */}
        <View className="flex-1 ml-4">
          <Text className="font-semibold text-base">{item.title}</Text>
          
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 line-through text-xs">${item.originalPrice.toFixed(2)}</Text>
            <Text className="ml-2 font-bold">${discountedPrice.toFixed(2)}</Text>
            <View className="bg-red-500 px-1 rounded ml-2">
              <Text className="text-white text-xs">{item.discountPercentage}% OFF</Text>
            </View>
          </View>
          
          {/* Quantity Controls */}
          <View className="flex-row items-center mt-2">
            <TouchableOpacity 
              className="bg-gray-200 w-8 h-8 rounded-full justify-center items-center"
              onPress={() => decreaseQuantity(item.id)}
            >
              <Ionicons name="remove" size={20} color="black" />
            </TouchableOpacity>
            
            <Text className="mx-3 font-bold">{item.quantity}</Text>
            
            <TouchableOpacity 
              className="bg-gray-200 w-8 h-8 rounded-full justify-center items-center"
              onPress={() => increaseQuantity(item.id)}
            >
              <Ionicons name="add" size={20} color="black" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="ml-auto"
              onPress={() => removeFromCart(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
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
          <Text className="text-xl font-bold text-gray-800">Shopping Cart</Text>
        </View>
        
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={() => clearCart()}>
            <Text className="text-red-500">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item: CartItem) => item.id.toString()}
          className="flex-1"
        />
      ) : (
        renderEmptyCart()
      )}
      
      {/* Order Summary */}
      {cartItems.length > 0 && (
        <View className="p-4 border-t border-gray-200">
          <Text className="text-lg font-bold mb-3">Order Summary</Text>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Shipping</Text>
            <Text>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Tax</Text>
            <Text>${tax.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-4 pt-3 border-t border-gray-200">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg">${total.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity 
            className="bg-yellow-500 py-3 rounded-full"
            onPress={handleCheckout}
          >
            <Text className="text-white font-bold text-center text-lg">Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}