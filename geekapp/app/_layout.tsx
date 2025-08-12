import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import './global.css';
import { CartProvider } from '../context/CartContext';
import { AppSettingsProvider, useAppSettings } from '../context/AppSettingsContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StatusBar, Platform } from "react-native";

// This component handles the app routing based on authentication and onboarding status
function RootLayoutNav() {
  const { hasSeenOnboarding, isLoading: settingsLoading } = useAppSettings();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (settingsLoading || authLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';

    // Authentication and onboarding flow logic
    if (!isAuthenticated) {
      // User is not authenticated
      if (!inAuthGroup && !inOnboardingGroup) {
        // Redirect to phone verification if not in auth or onboarding group
        router.replace('/auth/phone-verification');
      } else if (inOnboardingGroup) {
        // If in onboarding but not authenticated, redirect to auth
        router.replace('/auth/phone-verification');
      }
    } else {
      // User is authenticated
      if (inAuthGroup) {
        // If authenticated but in auth group, redirect to main app
        router.replace('/(tabs)');
      } else if (!hasSeenOnboarding && !inOnboardingGroup) {
        // If authenticated but hasn't seen onboarding, show onboarding
        router.replace('/onboarding');
      } else if (hasSeenOnboarding && inOnboardingGroup) {
        // If authenticated and has seen onboarding but in onboarding group, redirect to main app
        router.replace('/(tabs)');
      }
    }
  }, [hasSeenOnboarding, isAuthenticated, segments, settingsLoading, authLoading]);

  // Show a loading screen while checking status
  if (settingsLoading || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
      }}
    />
  );
}

// Root layout with all providers
export default function RootLayout() {
  // Set up global StatusBar
  useEffect(() => {
    // Ensure StatusBar is visible and properly configured
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FAFAFA');
      StatusBar.setTranslucent(true);
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" translucent={true} />
      <AppSettingsProvider>
        <AuthProvider>
          <CartProvider>
            <RootLayoutNav />
          </CartProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </>
  );
}
