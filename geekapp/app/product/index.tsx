import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    console.log('Product ID in nested route:', id);
    
    // Redirect to the flat route structure
    if (id) {
      router.replace(`/product/${id}`);
    } else {
      router.replace('/');
    }
  }, [id]);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting to product page...</Text>
      <TouchableOpacity 
        style={{ marginTop: 20, padding: 10, backgroundColor: '#F59E0B', borderRadius: 5 }}
        onPress={() => router.replace(`/product/${id}`)}
      >
        <Text style={{ color: 'white' }}>Go to Product</Text>
      </TouchableOpacity>
    </View>
  );
}