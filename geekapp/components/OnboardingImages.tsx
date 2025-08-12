import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Welcome Screen Image
export const WelcomeImage = () => (
  <View style={styles.container}>
    <View style={styles.logoContainer}>
      <Ionicons name="laptop-outline" size={80} color="#F59E0B" />
      <View style={styles.circleOverlay}>
        <Ionicons name="phone-portrait-outline" size={40} color="#F59E0B" />
      </View>
    </View>
  </View>
);

// B2B Store Image
export const B2BStoreImage = () => (
  <View style={styles.container}>
    <View style={styles.storeContainer}>
      <Ionicons name="business-outline" size={80} color="#F59E0B" />
      <View style={styles.arrowContainer}>
        <Ionicons name="arrow-forward" size={30} color="#F59E0B" />
      </View>
      <Ionicons name="business-outline" size={80} color="#F59E0B" />
    </View>
  </View>
);

// Notification Image
export const NotificationImage = () => (
  <View style={styles.container}>
    <View style={styles.notificationContainer}>
      <Ionicons name="notifications-outline" size={80} color="#F59E0B" />
      <View style={styles.notificationBadge}>
        <View style={styles.badge} />
      </View>
      <View style={styles.notificationWaves}>
        <View style={[styles.wave, { width: 60, height: 60 }]} />
        <View style={[styles.wave, { width: 80, height: 80 }]} />
        <View style={[styles.wave, { width: 100, height: 100 }]} />
      </View>
    </View>
  </View>
);

// Track Package Image
export const TrackPackageImage = () => (
  <View style={styles.container}>
    <View style={styles.trackingContainer}>
      <MaterialCommunityIcons name="truck-delivery-outline" size={80} color="#F59E0B" />
      <View style={styles.trackingLine}>
        <View style={styles.trackingDot} />
        <View style={styles.trackingDot} />
        <View style={styles.trackingDot} />
        <View style={[styles.trackingDot, styles.activeDot]} />
      </View>
    </View>
  </View>
);

// Exchange/Return Image
export const ExchangeReturnImage = () => (
  <View style={styles.container}>
    <View style={styles.exchangeContainer}>
      <Ionicons name="arrow-back" size={40} color="#F59E0B" />
      <View style={styles.packageIcon}>
        <Ionicons name="cube-outline" size={60} color="#F59E0B" />
      </View>
      <Ionicons name="arrow-forward" size={40} color="#F59E0B" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  logoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleOverlay: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 5,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  arrowContainer: {
    marginHorizontal: 10,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
  },
  notificationWaves: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#F59E0B',
    opacity: 0.3,
  },
  trackingContainer: {
    alignItems: 'center',
  },
  trackingLine: {
    flexDirection: 'row',
    marginTop: 20,
    width: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  trackingDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  activeDot: {
    backgroundColor: '#F59E0B',
  },
  exchangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageIcon: {
    marginHorizontal: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
});