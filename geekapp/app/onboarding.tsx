import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppSettings } from '../context/AppSettingsContext';
import { 
  WelcomeImage, 
  B2BStoreImage, 
  NotificationImage, 
  TrackPackageImage, 
  ExchangeReturnImage 
} from '../components/OnboardingImages';

const { width, height } = Dimensions.get('window');

// Onboarding data
const onboardingData = [
  {
    id: '1',
    title: 'Welcome to GeekLappy',
    description: 'Your one-stop shop for all electronic needs',
    imageComponent: WelcomeImage,
    logoImage: require('../assets/images/geeklappylogo.png'),
  },
  {
    id: '2',
    title: 'B2B Electronic Store in Mumbai',
    description: 'Get the best deals on bulk purchases for your business',
    imageComponent: B2BStoreImage,
  },
  {
    id: '3',
    title: 'Get Notified',
    description: 'Stay updated with the latest offers and product arrivals',
    imageComponent: NotificationImage,
  },
  {
    id: '4',
    title: 'Track Package',
    description: 'Real-time tracking of your orders from purchase to delivery',
    imageComponent: TrackPackageImage,
  },
  {
    id: '5',
    title: 'Exchange/Return',
    description: 'Hassle-free exchange and return policy for your convenience',
    imageComponent: ExchangeReturnImage,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAppSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  // Handle next button press
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as seen and navigate to the main app
      setHasSeenOnboarding(true);
      router.replace('/(tabs)');
    }
  };

  // Handle skip button press
  const handleSkip = () => {
    // Mark onboarding as seen and navigate to the main app
    setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  // Render onboarding item
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const ImageComponent = item.imageComponent;
    
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          {index === 0 ? (
            // First screen with GeekLappy logo
            <Image source={item.logoImage} style={styles.logoImage} resizeMode="contain" />
          ) : (
            // Other screens with custom images
            <ImageComponent />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.pageIndicator}>
            <Text style={styles.pageNumber}>{index + 1}/{onboardingData.length}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {index === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={index === onboardingData.length - 1 ? "checkmark-circle" : "arrow-forward"} 
              size={20} 
              color="#fff" 
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Skip button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        ref={slidesRef}
      />
      
      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Light white background
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    width: width * 0.9,
    height: height * 0.4,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: {
    width: width * 0.7,
    height: height * 0.3,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  pageIndicator: {
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#F59E0B',
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
});