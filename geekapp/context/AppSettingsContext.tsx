import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the context type
interface AppSettingsContextType {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  isLoading: boolean;
}

// Create the context with default values
const AppSettingsContext = createContext<AppSettingsContextType>({
  hasSeenOnboarding: false,
  setHasSeenOnboarding: () => {},
  isLoading: true,
});

// Custom hook to use the app settings context
export const useAppSettings = () => useContext(AppSettingsContext);

// Provider component
export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const value = await AsyncStorage.getItem('@hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.error('Error loading app settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change
  const updateHasSeenOnboarding = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('@hasSeenOnboarding', value.toString());
      setHasSeenOnboarding(value);
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  };

  return (
    <AppSettingsContext.Provider
      value={{
        hasSeenOnboarding,
        setHasSeenOnboarding: updateHasSeenOnboarding,
        isLoading,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};