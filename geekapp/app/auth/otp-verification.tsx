import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

// Number of OTP digits
const OTP_LENGTH = 6;

export default function OtpVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { phoneNumber } = params;
  const { setUserPhone } = useAuth();
  
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // References for OTP input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, OTP_LENGTH);
  }, []);
  
  // Timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);
  
  // Check if all OTP fields are filled
  useEffect(() => {
    const isComplete = otp.every((digit) => digit !== '');
    setIsButtonActive(isComplete);
  }, [otp]);
  
  // Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // If pasting multiple digits
      const digits = text.split('').slice(0, OTP_LENGTH - index);
      
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus on the next empty field or the last field
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      
      // Auto-focus next input if a digit was entered
      if (text && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on an empty field
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Handle verify button press
  const handleVerify = async () => {
    if (isButtonActive) {
      // In a real app, you would verify the OTP with your backend
      // For now, we'll just navigate to the registration screen
      
      // Simulate OTP verification
      const enteredOtp = otp.join('');
      
      // For demo purposes, any 6-digit OTP is considered valid
      if (enteredOtp.length === OTP_LENGTH) {
        try {
          // Save the user's phone number
          if (phoneNumber) {
            await setUserPhone(phoneNumber as string);
          }
          
          // Navigate to registration
          router.push('/auth/register');
        } catch (error) {
          console.error('Error during OTP verification:', error);
          Alert.alert('Error', 'There was an error during verification. Please try again.');
        }
      } else {
        Alert.alert('Invalid OTP', 'Please enter a valid OTP');
      }
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = () => {
    if (canResend) {
      // In a real app, you would call your backend to resend the OTP
      
      // Reset OTP fields
      setOtp(Array(OTP_LENGTH).fill(''));
      
      // Reset timer
      setTimer(30);
      setCanResend(false);
      
      // Focus on the first input
      inputRefs.current[0]?.focus();
      
      // Show confirmation message
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FAFAFA" translucent={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/geeklappylogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Title and Description */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.description}>
              We've sent a verification code to{' '}
              <Text style={styles.phoneText}>{phoneNumber}</Text>
            </Text>
          </View>
          
          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {Array(OTP_LENGTH).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                value={otp[index]}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus={index === 0}
              />
            ))}
          </View>
          
          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendButton}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            )}
          </View>
          
          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isButtonActive ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={handleVerify}
            disabled={!isButtonActive}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
            <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 80,
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneText: {
    fontWeight: 'bold',
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#F59E0B',
  },
  inactiveButton: {
    backgroundColor: '#D1D5DB',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});