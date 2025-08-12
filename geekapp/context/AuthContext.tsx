import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  userPhone: string | null;
  setUserPhone: (phone: string) => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  userPhone: null,
  setUserPhone: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhoneState] = useState<string | null>(null);

  // Load auth state from AsyncStorage on component mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const authStatus = await AsyncStorage.getItem('@isAuthenticated');
        const phone = await AsyncStorage.getItem('@userPhone');
        
        setIsAuthenticated(authStatus === 'true');
        setUserPhoneState(phone);
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Login function
  const login = async () => {
    try {
      await AsyncStorage.setItem('@isAuthenticated', 'true');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.setItem('@isAuthenticated', 'false');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Set user phone
  const setUserPhone = async (phone: string) => {
    try {
      await AsyncStorage.setItem('@userPhone', phone);
      setUserPhoneState(phone);
    } catch (error) {
      console.error('Error setting user phone:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        userPhone,
        setUserPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};