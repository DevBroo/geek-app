import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VerifyEmailProps {
  navigation: any;
}

const VerifyEmail = ({ navigation }: VerifyEmailProps) => {
  // Mock user email - in a real app, this would come from your auth context or API
  const userEmail = "user@example.com";
  const maskedEmail = userEmail.replace(/(\w{2})[\w.-]+@([\w.]+)/g, "$1***@$2");
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);
  
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);
  
  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]; // Only take the first character if multiple are pasted
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (text !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to verify OTP
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, any OTP is accepted
      // In a real app, you would verify with your backend
      navigation.navigate('SetNewPassword');
    }, 1500);
  };
  
  const handleResendOtp = () => {
    if (!canResend) return;
    
    // Simulate sending a new OTP
    setTimeLeft(60);
    setCanResend(false);
    
    // Show confirmation to user
    Alert.alert('Success', 'A new verification code has been sent to your email');
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Email Verification</Text>
        </View>
        
        <View className="flex-1 p-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-blue-50 justify-center items-center mb-4">
              <Ionicons name="mail-outline" size={40} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</Text>
            <Text className="text-center text-gray-500 mb-2">
              We've sent a verification code to
            </Text>
            <Text className="text-center font-medium text-gray-800">
              {maskedEmail}
            </Text>
          </View>
          
          <View className="mb-8">
            <Text className="text-sm text-gray-600 mb-4 font-medium text-center">
              Enter the 4-digit verification code
            </Text>
            
            <View className="flex-row justify-between mb-2">
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref }}
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  className="w-16 h-16 border border-gray-300 rounded-lg text-center text-xl font-bold text-gray-800"
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </View>
            
            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-gray-500">Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResendOtp}
                disabled={!canResend}
              >
                <Text className={`font-medium ${canResend ? 'text-[#FFBF00]' : 'text-gray-400'}`}>
                  {canResend ? 'Resend' : `Resend in ${timeLeft}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            className={`py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-[#FFBF00]'}`}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-center">
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmail;