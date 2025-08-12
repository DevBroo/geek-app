import React, { useState } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  Alert,
  StyleSheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import NotificationsScreen from '../../components/NotificationsScreen';
import SettingsScreen from '@/components/SettingsScreen';


// Import profile components
import PersonalInformation from '../../components/profile/PersonalInformation';
import Security, { VerifyCurrentPassword } from '../../components/profile/Security';
import NotificationSettings from '../../components/profile/NotificationSettings';
import LanguageSettings from '../../components/profile/LanguageSettings';
import GeekCashDetails from '../../components/profile/GeekCashDetails';
import Rewards from '../../components/profile/Rewards';
import AccountBalance from '../../components/profile/AccountBalance';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define interfaces for our data types
interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: any;
  inStock: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount: string;
  validUntil: string;
  isUsed: boolean;
}

const Profile = () => {
  const router = useRouter();
  
  // State variables
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  
  // State for profile page components
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showGeekCashDetails, setShowGeekCashDetails] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showAccountBalance, setShowAccountBalance] = useState(false);
  
  // Determine user membership level based on points
  const currentPoints = 1200; // Changed from 520 to 1200 to make it gold level
  const getMembershipType = (points: number) => {
    if (points >= 2000) return 'platinum';
    if (points >= 1000) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  };
  
  const membershipType = getMembershipType(currentPoints);
  
  // Import Notification interface from NotificationsScreen component
  interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'order' | 'promo' | 'system' | 'payment';
    image?: any;
  }

  // Notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #GK38219 has been shipped and will arrive in 2-3 business days.',
      time: '2 hours ago',
      isRead: false,
      type: 'order'
    },
    {
      id: '2',
      title: 'Special Offer',
      message: 'Get 20% off on all accessories this weekend! Use code WEEKEND20 at checkout.',
      time: '1 day ago',
      isRead: false,
      type: 'promo'
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Your payment of $189.97 for order #GK38219 was successful.',
      time: '2 days ago',
      isRead: true,
      type: 'payment'
    },
    {
      id: '4',
      title: 'New Feature Available',
      message: 'We\'ve added a new feature to track your orders in real-time. Check it out!',
      time: '1 week ago',
      isRead: true,
      type: 'system'
    }
  ]);
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    avatar: require('../../assets/images/icon.png')
  });
  
  // Sample addresses
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Home',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true
    },
    {
      id: '2',
      name: 'Work',
      line1: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefault: false
    }
  ]);
  
  // Sample payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      lastFour: '4242',
      expiryDate: '04/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'paypal',
      name: 'PayPal',
      isDefault: false
    },
    {
      id: '3',
      type: 'applepay',
      name: 'Apple Pay',
      isDefault: false
    }
  ]);
  
  // Sample wishlist items
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'Pro Wireless Mouse',
      price: 79.99,
      discountPrice: 59.99,
      image: require('../../assets/images/mouse1.jpg'),
      inStock: true
    },
    {
      id: '2',
      name: 'Mechanical Gaming Keyboard',
      price: 129.99,
      image: require('../../assets/images/keyboard1.jpg'),
      inStock: true
    },
    {
      id: '3',
      name: 'Ultra HD Monitor',
      price: 349.99,
      discountPrice: 299.99,
      image: require('../../assets/images/lap1.jpg'),
      inStock: false
    }
  ]);
  
  // Sample coupons
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'WELCOME20',
      discount: '20% off',
      validUntil: '2023-12-31',
      isUsed: false
    },
    {
      id: '2',
      code: 'SUMMER10',
      discount: '10% off',
      validUntil: '2023-09-30',
      isUsed: true
    }
  ]);
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Implement logout functionality
            console.log('User logged out');
          }
        }
      ]
    );
  };
  
  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setAddressModalVisible(true);
  };
  
  // Handle payment method selection
  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    setPaymentModalVisible(true);
  };
  
  // Handle remove from wishlist
  const handleRemoveFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Handle add to cart
  const handleAddToCart = (item: WishlistItem) => {
    // Implement add to cart functionality
    Alert.alert('Success', `${item.name} added to cart!`);
  };
  
  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark the notification as read
    setNotifications(prev => 
      prev.map(item => 
        item.id === notification.id 
          ? { ...item, isRead: true } 
          : item
      )
    );
    
    // Handle different notification types
    switch (notification.type) {
      case 'order':
        setActiveTab('orders');
        setNotificationsModalVisible(false);
        break;
      case 'promo':
        // Navigate to promotions or show coupon details
        Alert.alert('Promotion', notification.message);
        break;
      case 'payment':
        setActiveTab('orders');
        setNotificationsModalVisible(false);
        break;
      case 'system':
        // Show system notification details
        Alert.alert('System Update', notification.message);
        break;
      default:
        break;
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(item => ({ ...item, isRead: true }))
    );
  };
  
  // Render a wishlist item
  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.wishlistItem}>
      <Image source={item.image} style={styles.wishlistItemImage} />
      <View style={styles.wishlistItemDetails}>
        <Text style={styles.wishlistItemName}>{item.name}</Text>
        <View style={styles.wishlistItemPriceContainer}>
          {item.discountPrice ? (
            <>
              <Text style={styles.discountPrice}>${item.discountPrice}</Text>
              <Text style={styles.originalPrice}>${item.price}</Text>
            </>
          ) : (
            <Text style={styles.price}>${item.price}</Text>
          )}
        </View>
        <Text style={[
          styles.stockStatus,
          item.inStock ? styles.inStock : styles.outOfStock
        ]}>
          {item.inStock ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>
      <View style={styles.wishlistItemActions}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            !item.inStock && styles.disabledButton
          ]}
          disabled={!item.inStock}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render a coupon
  const renderCoupon = ({ item }: { item: Coupon }) => (
    <View style={[styles.couponCard, item.isUsed && styles.usedCouponCard]}>
      <View style={styles.couponLeft}>
        <Text style={styles.couponCode}>{item.code}</Text>
        <Text style={styles.couponDiscount}>{item.discount}</Text>
        <Text style={styles.couponValidity}>
          {item.isUsed ? 'Used' : `Valid until ${item.validUntil}`}
        </Text>
      </View>
      <View style={styles.couponDivider} />
      <View style={styles.couponRight}>
        <TouchableOpacity 
          style={[styles.couponButton, item.isUsed && styles.disabledButton]}
          disabled={item.isUsed}
        >
          <Text style={styles.couponButtonText}>
            {item.isUsed ? 'Used' : 'Use Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render Personal Information Modal
  const renderPersonalInfoModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showPersonalInfo}
      onRequestClose={() => setShowPersonalInfo(false)}
    >
      <PersonalInformation 
        navigation={{
          goBack: () => setShowPersonalInfo(false)
        }}
      />
    </Modal>
  );
  
  // State for password change flow
  const [showVerifyCurrentPassword, setShowVerifyCurrentPassword] = useState(false);
  
  // Render Security Modal
  const renderSecurityModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showSecurity}
      onRequestClose={() => setShowSecurity(false)}
    >
      <Security 
        navigation={{
          goBack: () => setShowSecurity(false),
          navigateToVerifyPassword: () => {
            setShowSecurity(false);
            setShowVerifyCurrentPassword(true);
          }
        }}
      />
    </Modal>
  );
  
  // Render VerifyCurrentPassword Modal
  const renderVerifyCurrentPasswordModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showVerifyCurrentPassword}
      onRequestClose={() => setShowVerifyCurrentPassword(false)}
    >
      <VerifyCurrentPassword 
        navigation={{
          goBack: () => setShowVerifyCurrentPassword(false)
        }}
      />
    </Modal>
  );
  
  // Render Notification Settings Modal
  const renderNotificationSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showNotificationSettings}
      onRequestClose={() => setShowNotificationSettings(false)}
    >
      <NotificationSettings 
        navigation={{
          goBack: () => setShowNotificationSettings(false)
        }}
      />
    </Modal>
  );
  
  // Render Language Settings Modal
  const renderLanguageSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showLanguageSettings}
      onRequestClose={() => setShowLanguageSettings(false)}
    >
      <LanguageSettings 
        navigation={{
          goBack: () => setShowLanguageSettings(false)
        }}
      />
    </Modal>
  );
  
  // Render GeekCash Details Modal
  const renderGeekCashDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showGeekCashDetails}
      onRequestClose={() => setShowGeekCashDetails(false)}
    >
      <GeekCashDetails 
        navigation={{
          goBack: () => setShowGeekCashDetails(false)
        }}
        route={{
          params: {
            membershipType: 'gold', // Example value
            currentPoints: 1500 // Example value
          }
        }}
      />
    </Modal>
  );
  
  // Render Rewards Modal
  const renderRewardsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showRewards}
      onRequestClose={() => setShowRewards(false)}
    >
      <Rewards 
        navigation={{
          goBack: () => setShowRewards(false)
        }}
        route={{ params: { membershipType, currentPoints } }}
      />
    </Modal>
  );
  
  // Render Account Balance Modal
  const renderAccountBalanceModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showAccountBalance}
      onRequestClose={() => setShowAccountBalance(false)}
    >
      <AccountBalance 
        navigation={{
          goBack: () => setShowAccountBalance(false)
        }}
      />
    </Modal>
  );
  
  // Profile Tab Content
  const renderProfileTab = () => (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Account & Preferences */}
      <View className="bg-white rounded-xl p-4 mx-4 mt-4 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-4">Account & Preferences</Text>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setShowPersonalInfo(true)}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="person-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Personal Information</Text>
            <Text className="text-xs text-gray-500">Manage your personal details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setShowSecurity(true)}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="lock-closed-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Security</Text>
            <Text className="text-xs text-gray-500">Change password and security settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setShowNotificationSettings(true)}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="notifications-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Notifications</Text>
            <Text className="text-xs text-gray-500">Manage notification preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setShowLanguageSettings(true)}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="language-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Language</Text>
            <Text className="text-xs text-gray-500">English (US)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
      </View>
      
      {/* Loyalty & Rewards */}
      <View className="bg-white rounded-xl p-4 mx-4 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-4">GeekCash & Rewards</Text>
        
        {/* Membership Card - Color changes based on membership level */}
        <TouchableOpacity 
          onPress={() => setShowGeekCashDetails(true)}
          activeOpacity={0.8}
        >
          <View 
            className={`rounded-lg p-4 mb-4 border`}
            style={{
              backgroundColor: membershipType === 'bronze' ? '#f5efe7' : 
                              membershipType === 'silver' ? '#f5f5f5' : 
                              membershipType === 'gold' ? '#fffbeb' : '#f8fafc',
              borderColor: membershipType === 'bronze' ? '#e0d0c1' : 
                          membershipType === 'silver' ? '#e0e0e0' : 
                          membershipType === 'gold' ? '#faecc8' : '#e2e8f0',
            }}
          >
          <View className="flex-row justify-between items-center mb-3">
            <Text 
              className="text-base font-semibold"
              style={{
                color: membershipType === 'bronze' ? '#CD7F32' : 
                      membershipType === 'silver' ? '#C0C0C0' : 
                      membershipType === 'gold' ? '#FFD700' : '#E5E4E2',
              }}
            >
              {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Member
            </Text>
            <TouchableOpacity onPress={() => setShowGeekCashDetails(true)}>
              <Text 
                className="text-sm font-medium"
                style={{
                  color: membershipType === 'bronze' ? '#CD7F32' : 
                        membershipType === 'silver' ? '#C0C0C0' : 
                        membershipType === 'gold' ? '#FFD700' : '#E5E4E2',
                }}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Current Points</Text>
              <Text 
                className="text-xl font-bold"
                style={{
                  color: membershipType === 'bronze' ? '#CD7F32' : 
                        membershipType === 'silver' ? '#C0C0C0' : 
                        membershipType === 'gold' ? '#FFD700' : '#E5E4E2',
                }}
              >
                {currentPoints}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Next Tier</Text>
              <Text className="text-sm text-gray-700">
                {membershipType === 'bronze' ? '500 points to Silver' : 
                 membershipType === 'silver' ? '1,000 points to Gold' : 
                 membershipType === 'gold' ? '2,000 points to Platinum' : 
                 'Highest tier reached'}
              </Text>
            </View>
          </View>
          
          <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <View 
              className="h-full rounded-full" 
              style={{ 
                width: membershipType === 'bronze' ? `${(currentPoints / 500) * 100}%` : 
                      membershipType === 'silver' ? `${((currentPoints - 500) / 500) * 100}%` : 
                      membershipType === 'gold' ? `${((currentPoints - 1000) / 1000) * 100}%` : '100%',
                backgroundColor: membershipType === 'bronze' ? '#CD7F32' : 
                                membershipType === 'silver' ? '#C0C0C0' : 
                                membershipType === 'gold' ? '#FFD700' : '#E5E4E2',
              }} 
            />
          </View>
        </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setShowRewards(true)}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="gift-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Rewards</Text>
            <Text className="text-xs text-gray-500">View available rewards and offers</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setShowAccountBalance(true)}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="wallet-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Account Balance</Text>
            <Text className="text-xs text-gray-500">View available Cash on your wallet</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        
      </View>
      
      {/* Shopping */}
      <View className="bg-white rounded-xl p-4 mx-4 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-4">Shopping</Text>
        
        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="cube-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">My Orders</Text>
            <Text className="text-xs text-gray-500">Track, return or buy again</Text>
          </View>
          <View className="bg-blue-500 rounded-full px-2 py-0.5">
            <Text className="text-xs text-white font-medium">3</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" className="ml-2" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="card-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Payment Methods</Text>
            <Text className="text-xs text-gray-500">Manage your payment options</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="location-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Shipping Addresses</Text>
            <Text className="text-xs text-gray-500">Manage delivery addresses</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="return-down-back-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Returns & Refunds</Text>
            <Text className="text-xs text-gray-500">View return policy and manage returns</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      {/* Recently Viewed
      <View className="bg-white rounded-xl p-4 mx-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-gray-800">Recently Viewed</Text>
          <TouchableOpacity>
            <Text className="text-sm text-yellow-500">See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {wishlistItems.map((item, index) => (
            <TouchableOpacity key={index} className="mr-3 w-[120px]">
              <Image source={item.image} className="w-[120px] h-[120px] rounded-lg mb-2" />
              <Text className="text-sm text-gray-800 font-medium" numberOfLines={1}>{item.name}</Text>
              <Text className="text-sm text-yellow-500 font-bold">${item.discountPrice || item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> */}
      
      {/* Support & About */}
      <View className="bg-white rounded-xl p-4 mx-4 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-4">Support & About</Text>
        
        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="help-circle-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Help Center</Text>
            <Text className="text-xs text-gray-500">Get help and find answers to questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="chatbubble-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Chat Support</Text>
            <Text className="text-xs text-gray-500">Talk to our customer service team</Text>
          </View>
          <View className="bg-green-500 rounded-full w-2 h-2 mr-2" />
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="star-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Rate Our App</Text>
            <Text className="text-xs text-gray-500">Tell us what you think</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="call-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Contact Info</Text>
            <Text className="text-xs text-gray-500">Contact Us for any Query</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="star-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">FAQs</Text>
            <Text className="text-xs text-gray-500">Browse Frequently Asked Questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="star-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Return Policy</Text>
            <Text className="text-xs text-gray-500">Easy 7-Day Return Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center py-3">
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Ionicons name="document-text-outline" size={22} color="#FFBF00" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-gray-800">Terms & Policies</Text>
            <Text className="text-xs text-gray-500">Privacy policy and terms of service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-white rounded-xl p-4 mx-4 mb-4 shadow-sm"
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text className="text-base font-medium text-red-500 ml-2">Logout</Text>
      </TouchableOpacity>
      
      <View className="items-center mb-6">
        <Text className="text-xs text-gray-500">GeekLappy v1.0.0</Text>
      </View>
    </ScrollView>
  );
  
  // Addresses Tab Content
  const renderAddressesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.addressesHeader}>
        <Text style={styles.addressesTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>
      
      {addresses.map(address => (
        <TouchableOpacity 
          key={address.id} 
          style={styles.addressCard}
          onPress={() => handleAddressSelect(address)}
        >
          <View style={styles.addressCardHeader}>
            <View style={styles.addressNameContainer}>
              <Text style={styles.addressName}>{address.name}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </View>
          
          <View style={styles.addressDetails}>
            <Text style={styles.addressLine}>{address.line1}</Text>
            {address.line2 && <Text style={styles.addressLine}>{address.line2}</Text>}
            <Text style={styles.addressLine}>{`${address.city}, ${address.state} ${address.postalCode}`}</Text>
            <Text style={styles.addressLine}>{address.country}</Text>
            <Text style={styles.addressPhone}>{address.phone}</Text>
          </View>
          
          <View style={styles.addressActions}>
            <TouchableOpacity style={styles.addressActionButton}>
              <Ionicons name="create-outline" size={18} color="#007AFF" />
              <Text style={styles.addressActionText}>Edit</Text>
            </TouchableOpacity>
            
            {!address.isDefault && (
              <TouchableOpacity style={styles.addressActionButton}>
                <Ionicons name="star-outline" size={18} color="#007AFF" />
                <Text style={styles.addressActionText}>Set as Default</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.addressActionButton}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              <Text style={[styles.addressActionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  // Payment Methods Tab Content
  const renderPaymentTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.paymentsHeader}>
        <Text style={styles.paymentsTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>
      
      {paymentMethods.map(payment => (
        <TouchableOpacity 
          key={payment.id} 
          style={styles.paymentCard}
          onPress={() => handlePaymentSelect(payment)}
        >
          <View style={styles.paymentCardHeader}>
            <View style={styles.paymentTypeContainer}>
              {payment.type === 'card' && <Ionicons name="card" size={24} color="#007AFF" />}
              {payment.type === 'paypal' && <Ionicons name="logo-paypal" size={24} color="#0070BA" />}
              {payment.type === 'applepay' && <Ionicons name="logo-apple" size={24} color="#000000" />}
              {payment.type === 'googlepay' && <Ionicons name="logo-google" size={24} color="#4285F4" />}
              <Text style={styles.paymentName}>{payment.name}</Text>
              {payment.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </View>
          
          {payment.type === 'card' && (
            <View style={styles.cardDetails}>
              <Text style={styles.cardNumber}>•••• •••• •••• {payment.lastFour}</Text>
              <Text style={styles.cardExpiry}>Expires {payment.expiryDate}</Text>
            </View>
          )}
          
          <View style={styles.paymentActions}>
            {!payment.isDefault && (
              <TouchableOpacity style={styles.paymentActionButton}>
                <Ionicons name="star-outline" size={18} color="#007AFF" />
                <Text style={styles.paymentActionText}>Set as Default</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.paymentActionButton}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              <Text style={[styles.paymentActionText, { color: '#FF3B30' }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  // Wishlist Tab Content
  const renderWishlistTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.wishlistHeader}>
        <Text style={styles.wishlistTitle}>My Wishlist</Text>
        <Text style={styles.wishlistCount}>{wishlistItems.length} items</Text>
      </View>
      
      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.wishlistList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="heart" size={80} color="#EEEEEE" />
          <Text style={styles.emptyStateTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyStateMessage}>
            Items added to your wishlist will appear here
          </Text>
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  // Orders Tab Content
  const renderOrdersTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        
        {/* Sample Orders - You can replace with actual order data */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #GK38219</Text>
              <Text style={styles.orderDate}>Placed on June 15, 2023</Text>
            </View>
            <View style={styles.orderStatusBadge}>
              <Text style={styles.orderStatusText}>Delivered</Text>
            </View>
          </View>
          
          <View style={styles.orderItems}>
            <Image source={require('../../assets/images/mouse1.jpg')} style={styles.orderItemImage} />
            <Image source={require('../../assets/images/keyboard1.jpg')} style={styles.orderItemImage} />
            <View style={styles.orderItemsMore}>
              <Text style={styles.orderItemsMoreText}>+1</Text>
            </View>
          </View>
          
          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotal}>$189.97</Text>
            </View>
            <TouchableOpacity style={styles.viewOrderButton}>
              <Text style={styles.viewOrderButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #GK37192</Text>
              <Text style={styles.orderDate}>Placed on May 28, 2023</Text>
            </View>
            <View style={[styles.orderStatusBadge, styles.processingBadge]}>
              <Text style={styles.orderStatusText}>Processing</Text>
            </View>
          </View>
          
          <View style={styles.orderItems}>
            <Image source={require('../../assets/images/lap1.jpg')} style={styles.orderItemImage} />
          </View>
          
          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotal}>$299.99</Text>
            </View>
            <TouchableOpacity style={styles.viewOrderButton}>
              <Text style={styles.viewOrderButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #GK35981</Text>
              <Text style={styles.orderDate}>Placed on April 10, 2023</Text>
            </View>
            <View style={styles.orderStatusBadge}>
              <Text style={styles.orderStatusText}>Delivered</Text>
            </View>
          </View>
          
          <View style={styles.orderItems}>
            <Image source={require('../../assets/images/keyboard1.jpg')} style={styles.orderItemImage} />
            <Image source={require('../../assets/images/mouse1.jpg')} style={styles.orderItemImage} />
          </View>
          
          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotal}>$209.98</Text>
            </View>
            <TouchableOpacity style={styles.viewOrderButton}>
              <Text style={styles.viewOrderButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.viewAllOrdersButton}>
        <Text style={styles.viewAllOrdersText}>View All Orders</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  
  // Edit Profile Modal
  const EditProfileModal = () => (
    <Modal
      visible={editProfileModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditProfileModalVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-center">
        <View className="bg-white rounded-xl mx-4 p-4 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View className="items-center mb-6 relative">
            <Image 
              source={userProfile.avatar} 
              className="w-24 h-24 rounded-full" 
            />
            <TouchableOpacity className="absolute bottom-0 right-1/3 bg-yellow-500 w-9 h-9 rounded-full justify-center items-center border-2 border-white">
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Full Name</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-2.5 text-base"
              value={userProfile.name}
              onChangeText={(text) => setUserProfile({...userProfile, name: text})}
              placeholder="Enter your full name"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Email</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-2.5 text-base"
              value={userProfile.email}
              onChangeText={(text) => setUserProfile({...userProfile, email: text})}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Phone Number</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-2.5 text-base"
              value={userProfile.phone}
              onChangeText={(text) => setUserProfile({...userProfile, phone: text})}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <TouchableOpacity 
            className="bg-yellow-500 rounded-lg py-3 items-center mt-2"
            onPress={() => setEditProfileModalVisible(false)}
          >
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50 mb-8">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 mt-8">
        <Text className="text-xl font-bold text-gray-800">My Account</Text>
        <View className="flex-row">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-2 relative"
            onPress={() => setNotificationsModalVisible(true)}
          >
            <Ionicons name="notifications-outline" size={22} color="#666" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                <Text className="text-white text-xs font-bold">
                  {notifications.filter(n => !n.isRead).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            onPress={() => setSettingsModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* User Summary Card - Always visible */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <Image source={userProfile.avatar} className="w-[60px] h-[60px] rounded-full mr-4" />
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{userProfile.name}</Text>
          <Text className="text-xs text-gray-500 mb-1">{userProfile.email}</Text>
          <View className="flex-row items-center">
            <View className="bg-yellow-100 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-xs text-yellow-700 font-medium">Gold Member</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-xs text-yellow-500 font-medium">View Benefits</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-gray-100 rounded-lg p-2"
          onPress={() => setEditProfileModalVisible(true)}
        >
          <Ionicons name="pencil" size={18} color="#FFBF00" />
        </TouchableOpacity>
      </View>
      
      {/* Quick Stats */}
      <View className="flex-row bg-white py-3 border-b border-gray-100">
        <TouchableOpacity disabled className="flex-1 items-center border-r border-gray-100">
          <Text className="text-lg font-bold text-gray-800">12</Text>
          <Text className="text-xs text-gray-500">Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled className="flex-1 items-center border-r border-gray-100">
          <Text className="text-lg font-bold text-gray-800">3</Text>
          <Text className="text-xs text-gray-500">Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled className="flex-1 items-center border-r border-gray-100">
          <Text className="text-lg font-bold text-yellow-500">520</Text>
          <Text className="text-xs text-gray-500">Points</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-800">{wishlistItems.length}</Text>
          <Text className="text-xs text-gray-500">Wishlist</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Navigation */}
      <View className="flex-row bg-white border-b border-gray-200 py-2">
        <TouchableOpacity 
          className={`flex-1 items-center py-2 ${activeTab === 'profile' ? 'border-b-2 border-yellow-500' : ''}`}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person" 
            size={22} 
            color={activeTab === 'profile' ? "#FFBF00" : "#999"} 
          />
          <Text 
            className={`text-xs mt-1 ${activeTab === 'profile' ? 'text-yellow-500 font-medium' : 'text-gray-500'}`}
          >
            Account
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 items-center py-2 ${activeTab === 'orders' ? 'border-b-2 border-yellow-500' : ''}`}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons 
            name="cube" 
            size={22} 
            color={activeTab === 'orders' ? "#FFBF00" : "#999"} 
          />
          <Text 
            className={`text-xs mt-1 ${activeTab === 'orders' ? 'text-yellow-500 font-medium' : 'text-gray-500'}`}
          >
            Orders
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 items-center py-2 ${activeTab === 'addresses' ? 'border-b-2 border-yellow-500' : ''}`}
          onPress={() => setActiveTab('addresses')}
        >
          <Ionicons 
            name="location" 
            size={22} 
            color={activeTab === 'addresses' ? "#FFBF00" : "#999"} 
          />
          <Text 
            className={`text-xs mt-1 ${activeTab === 'addresses' ? 'text-yellow-500 font-medium' : 'text-gray-500'}`}
          >
            Addresses
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 items-center py-2 ${activeTab === 'payment' ? 'border-b-2 border-yellow-500' : ''}`}
          onPress={() => setActiveTab('payment')}
        >
          <Ionicons 
            name="card" 
            size={22} 
            color={activeTab === 'payment' ? "#FFBF00" : "#999"} 
          />
          <Text 
            className={`text-xs mt-1 ${activeTab === 'payment' ? 'text-yellow-500 font-medium' : 'text-gray-500'}`}
          >
            Payment
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 items-center py-2 ${activeTab === 'wishlist' ? 'border-b-2 border-yellow-500' : ''}`}
          onPress={() => setActiveTab('wishlist')}
        >
          <Ionicons 
            name="heart" 
            size={22} 
            color={activeTab === 'wishlist' ? "#FFBF00" : "#999"} 
          />
          <Text 
            className={`text-xs mt-1 ${activeTab === 'wishlist' ? 'text-yellow-500 font-medium' : 'text-gray-500'}`}
          >
            Wishlist
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'orders' && renderOrdersTab()}
      {activeTab === 'addresses' && renderAddressesTab()}
      {activeTab === 'payment' && renderPaymentTab()}
      {activeTab === 'wishlist' && renderWishlistTab()}
      
      {/* Modals */}
      <EditProfileModal />
      
      {/* Profile Component Modals */}
      {renderPersonalInfoModal()}
      {renderSecurityModal()}
      {renderNotificationSettingsModal()}
      {renderLanguageSettingsModal()}
      {renderGeekCashDetailsModal()}
      {renderRewardsModal()}
      {renderAccountBalanceModal()}
      
      {/* Notifications Modal */}
      <NotificationsScreen
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationPress={handleNotificationPress}
      />
      
      {/* Settings Modal */}
      <SettingsScreen
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        darkModeEnabled={darkModeEnabled}
        notificationsEnabled={notificationsEnabled}
        biometricEnabled={biometricEnabled}
        onToggleDarkMode={setDarkModeEnabled}
        onToggleNotifications={setNotificationsEnabled}
        onToggleBiometric={setBiometricEnabled}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};


export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#F9A826',
  },
  tabLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#F9A826',
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666666',
  },
  editProfileButton: {
    backgroundColor: '#F2F3F5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
  addressesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  addressesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9A826',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#F9A826',
    fontWeight: '500',
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressLine: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  addressActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  addressActionText: {
    fontSize: 14,
    color: '#F9A826',
    marginLeft: 4,
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  paymentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
    marginRight: 8,
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666666',
  },
  paymentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  paymentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentActionText: {
    fontSize: 14,
    color: '#F9A826',
    marginLeft: 4,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  wishlistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  wishlistCount: {
    fontSize: 14,
    color: '#999999',
  },
  wishlistList: {
    padding: 16,
    paddingTop: 0,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  wishlistItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  wishlistItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  wishlistItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  wishlistItemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  inStock: {
    color: '#4CAF50',
  },
  outOfStock: {
    color: '#FF3B30',
  },
  wishlistItemActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9A826',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#F9A826',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  couponsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  couponsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  couponFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponFilterText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  couponsList: {
    padding: 16,
    paddingTop: 0,
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  usedCouponCard: {
    opacity: 0.6,
  },
  couponLeft: {
    flex: 3,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  couponCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  couponDiscount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  couponValidity: {
    fontSize: 12,
    color: '#999999',
  },
  couponDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  couponRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  couponButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  couponButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999999',
  },
  orderStatusBadge: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  processingBadge: {
    backgroundColor: '#FF9500',
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  orderItems: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  orderItemsMore: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItemsMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  viewOrderButton: {
    backgroundColor: '#F2F3F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewOrderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  viewAllOrdersButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  viewAllOrdersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 50,
    backgroundColor: '#FFBF00',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F3F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FFBF00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

