import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useAuth } from '../../context/AuthContext';

// Validation regex patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Radio button component
const RadioButton = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => (
  <TouchableOpacity style={styles.radioButtonContainer} onPress={onPress}>
    <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
      {selected && <View style={styles.radioButtonInner} />}
    </View>
    <Text style={styles.radioButtonLabel}>{label}</Text>
  </TouchableOpacity>
);

// Checkbox component
const Checkbox = ({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Ionicons name="checkmark" size={16} color="white" />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function Register() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAppSettings();
  const { login, userPhone } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [hasGST, setHasGST] = useState<boolean | null>(null);
  const [gstNumber, setGstNumber] = useState('');
  const [isVerifyingGST, setIsVerifyingGST] = useState(false);
  const [isGSTVerified, setIsGSTVerified] = useState(false);
  const [urd, setUrd] = useState('');
  const [shopName, setShopName] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  
  // Form validation
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isGSTNumberValid, setIsGSTNumberValid] = useState(true);
  
  // Update shipping address when checkbox is toggled
  useEffect(() => {
    if (sameAsShipping) {
      setShippingAddress(billingAddress);
    }
  }, [sameAsShipping, billingAddress]);
  
  // Validate email
  useEffect(() => {
    if (email.trim() === '') {
      setIsEmailValid(true); // Don't show error for empty field
    } else {
      setIsEmailValid(EMAIL_REGEX.test(email));
    }
  }, [email]);
  
  // Validate GST number
  useEffect(() => {
    if (gstNumber.trim() === '') {
      setIsGSTNumberValid(true); // Don't show error for empty field
    } else {
      setIsGSTNumberValid(GST_REGEX.test(gstNumber));
    }
  }, [gstNumber]);
  
  // Validate form
  useEffect(() => {
    let valid = username.trim() !== '' && 
                email.trim() !== '' && 
                isEmailValid &&
                hasGST !== null;
    
    if (hasGST) {
      // For GST path, we only need a valid GST number (15 digits)
      valid = valid && gstNumber.trim() !== '' && isGSTNumberValid;
    } else {
      valid = valid && 
              urd.trim() !== '' && 
              shopName.trim() !== '' && 
              pincode.trim() !== '' && 
              state.trim() !== '' && 
              city.trim() !== '' && 
              billingAddress.trim() !== '' && 
              shippingAddress.trim() !== '';
    }
    
    setIsFormValid(valid);
  }, [
    username, 
    email, 
    isEmailValid,
    hasGST, 
    gstNumber, 
    isGSTNumberValid,
    urd, 
    shopName, 
    pincode, 
    state, 
    city, 
    billingAddress, 
    shippingAddress
  ]);
  
  // Handle GST verification
  const handleVerifyGST = () => {
    if (gstNumber.trim() === '') {
      Alert.alert('Error', 'Please enter a GST number');
      return;
    }
    
    if (!GST_REGEX.test(gstNumber)) {
      Alert.alert('Error', 'GST number must be exactly 15 digits');
      return;
    }
    
    setIsVerifyingGST(true);
    
    // Simulate GST verification
    setTimeout(() => {
      setIsVerifyingGST(false);
      setIsGSTVerified(true);
      
      // In a real app, you would get these details from the GST verification API
      setShopName('Auto-filled Business Name');
      setState('Maharashtra');
      setCity('Mumbai');
      setBillingAddress('123, Business District, Mumbai, Maharashtra, 400001');
      
      Alert.alert('Success', 'GST number verified successfully');
    }, 2000);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    try {
      // In a real app, you would submit the form data to your backend
      
      // Set the user as authenticated
      await login();
      
      // Mark onboarding as seen
      setHasSeenOnboarding(true);
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'There was an error during registration. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor="#FAFAFA" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/geeklappylogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Register Your Business on</Text>
            <Text style={styles.subtitle}>'Geek Lappy B2B'</Text>
          </View>
          
          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>
            
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, !isEmailValid && styles.invalidInput]}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {!isEmailValid && email.trim() !== '' && (
                <Text style={styles.errorText}>Please enter a valid email address</Text>
              )}
            </View>
            
            {/* GST Question */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Do you have a GST Number?</Text>
              <View style={styles.radioGroup}>
                <RadioButton
                  selected={hasGST === true}
                  onPress={() => setHasGST(true)}
                  label="Yes"
                />
                <RadioButton
                  selected={hasGST === false}
                  onPress={() => setHasGST(false)}
                  label="No"
                />
              </View>
            </View>
            
            {/* Conditional fields based on GST */}
            {hasGST === true && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>GST Number</Text>
                <View style={styles.inputContainerWithButton}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input, 
                      isGSTVerified && styles.verifiedInput,
                      !isGSTNumberValid && styles.invalidInput
                    ]}
                    placeholder="Enter GST number (15 digits)"
                    value={gstNumber}
                    onChangeText={(text) => {
                      setGstNumber(text);
                      setIsGSTVerified(false);
                    }}
                    keyboardType="number-pad"
                    maxLength={15}
                    editable={!isGSTVerified}
                  />
                  {isGSTVerified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        (!isGSTNumberValid || gstNumber.length !== 15) && styles.disabledButton
                      ]}
                      onPress={handleVerifyGST}
                      disabled={isVerifyingGST || !isGSTNumberValid || gstNumber.length !== 15}
                    >
                      {isVerifyingGST ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                {!isGSTNumberValid && gstNumber.trim() !== '' && (
                  <Text style={styles.errorText}>GST number must be exactly 15 digits</Text>
                )}
              </View>
            )}
            
            {hasGST === false && (
              <>
                {/* URD */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>URD</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="identifier" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter URD"
                      value={urd}
                      onChangeText={setUrd}
                    />
                  </View>
                </View>
                
                {/* Shop Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Shop Name</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter shop name"
                      value={shopName}
                      onChangeText={setShopName}
                    />
                  </View>
                </View>
                
                {/* Pincode */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pincode</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter pincode"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={pincode}
                      onChangeText={setPincode}
                    />
                  </View>
                </View>
                
                {/* State */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>State</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter state"
                      value={state}
                      onChangeText={setState}
                    />
                  </View>
                </View>
                
                {/* City */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>City</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter city"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>
                
                {/* Billing Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Billing Address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter billing address"
                      multiline
                      numberOfLines={3}
                      value={billingAddress}
                      onChangeText={setBillingAddress}
                    />
                  </View>
                </View>
                
                {/* Same as Billing Checkbox */}
                <View style={styles.checkboxGroup}>
                  <Checkbox
                    checked={sameAsShipping}
                    onPress={() => setSameAsShipping(!sameAsShipping)}
                    label="The shipping address is same as the Billing Address"
                  />
                </View>
                
                {/* Shipping Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Shipping Address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="navigate-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter shipping address"
                      multiline
                      numberOfLines={3}
                      value={shippingAddress}
                      onChangeText={setShippingAddress}
                      editable={!sameAsShipping}
                    />
                  </View>
                </View>
              </>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isFormValid ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid}
            >
              <Text style={styles.submitButtonText}>Register</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  inputContainerWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  verifiedInput: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  verifyButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  verifiedText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 5,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#F59E0B',
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  radioButtonLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkboxGroup: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
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
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  invalidInput: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
});