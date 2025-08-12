import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function TestNavigation() {
  const router = useRouter();
  
  // Test products
  const products = [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
    { id: 3, name: 'Product 3' },
  ];
  
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Stack.Screen options={{ title: 'Navigation Test' }} />
      
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Test Product Navigation
      </Text>
      
      <ScrollView>
        {products.map(product => (
          <View key={product.id} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>{product.name}</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#F59E0B', 
                  padding: 10, 
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 5,
                  alignItems: 'center'
                }}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <Text style={{ color: 'white' }}>Direct Path</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#3B82F6', 
                  padding: 10, 
                  borderRadius: 5,
                  flex: 1,
                  marginLeft: 5,
                  alignItems: 'center'
                }}
                onPress={() => router.push({
                  pathname: '/product/[id]',
                  params: { id: product.id.toString() }
                })}
              >
                <Text style={{ color: 'white' }}>Structured Path</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <TouchableOpacity
          style={{ 
            backgroundColor: '#10B981', 
            padding: 15, 
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 20
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}