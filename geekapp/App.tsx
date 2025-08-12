// Example App.tsx with WebSocket initialization
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { initializeConnection } from './services/axiosConfig';
import { RealTimeConnectionStatus } from './components/RealTimeConnectionStatus';

export default function App() {
  useEffect(() => {
    // Initialize WebSocket and Axios connections
    initializeConnection().catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      {/* Real-time connection status */}
      <RealTimeConnectionStatus showDetails style={styles.connectionStatus} />
      
      <Text style={styles.title}>GeekLappy</Text>
      <Text style={styles.subtitle}>Real-time E-commerce App</Text>
      
      <StatusBar style="auto" />
      
      {/* Your existing app content goes here */}
      {/* <Navigation /> or <YourAppContent /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  connectionStatus: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});