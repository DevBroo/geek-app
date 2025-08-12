import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  Alert,
  FlatList,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: 'purchase' | 'refund' | 'cashback' | 'deposit' | 'withdrawal';
}

interface AccountBalanceProps {
  navigation: any;
}

const AccountBalance = ({ navigation }: AccountBalanceProps) => {
  const [currentBalance] = useState(2450.75);
  const [pendingBalance] = useState(125.50);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 150.00,
      description: 'Cashback from Order #GK38219',
      date: '2024-01-15',
      status: 'completed',
      category: 'cashback'
    },
    {
      id: '2',
      type: 'debit',
      amount: 299.99,
      description: 'Purchase - Gaming Laptop',
      date: '2024-01-14',
      status: 'completed',
      category: 'purchase'
    },
    {
      id: '3',
      type: 'credit',
      amount: 500.00,
      description: 'Wallet Top-up via UPI',
      date: '2024-01-12',
      status: 'completed',
      category: 'deposit'
    },
    {
      id: '4',
      type: 'credit',
      amount: 75.25,
      description: 'Refund for Order #GK37192',
      date: '2024-01-10',
      status: 'completed',
      category: 'refund'
    },
    {
      id: '5',
      type: 'debit',
      amount: 189.50,
      description: 'Purchase - Wireless Mouse & Keyboard',
      date: '2024-01-08',
      status: 'completed',
      category: 'purchase'
    },
    {
      id: '6',
      type: 'credit',
      amount: 25.50,
      description: 'Cashback from Order #GK36145',
      date: '2024-01-05',
      status: 'pending',
      category: 'cashback'
    }
  ]);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'credit', label: 'Credits' },
    { key: 'debit', label: 'Debits' },
    { key: 'pending', label: 'Pending' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'credit') return transaction.type === 'credit';
    if (selectedFilter === 'debit') return transaction.type === 'debit';
    if (selectedFilter === 'pending') return transaction.status === 'pending';
    return true;
  });

  const handleAddMoney = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    Alert.alert(
      'Add Money',
      `Add ₹${addAmount} to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setShowAddMoneyModal(false);
            setAddAmount('');
            Alert.alert('Success', 'Money added successfully!');
          }
        }
      ]
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > currentBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance to withdraw this amount');
      return;
    }
    
    Alert.alert(
      'Withdraw Money',
      `Withdraw ₹${withdrawAmount} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            Alert.alert('Success', 'Withdrawal request submitted successfully!');
          }
        }
      ]
    );
  };

  const getTransactionIcon = (category: string, type: string) => {
    switch (category) {
      case 'purchase':
        return 'bag-outline';
      case 'refund':
        return 'return-up-back-outline';
      case 'cashback':
        return 'cash-outline';
      case 'deposit':
        return 'add-circle-outline';
      case 'withdrawal':
        return 'remove-circle-outline';
      default:
        return type === 'credit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'pending') return '#FF9500';
    if (status === 'failed') return '#FF3B30';
    return type === 'credit' ? '#34C759' : '#FF3B30';
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-12 h-12 rounded-full justify-center items-center mr-3"
            style={{ backgroundColor: `${getTransactionColor(item.type, item.status)}15` }}
          >
            <Ionicons 
              name={getTransactionIcon(item.category, item.type)} 
              size={24} 
              color={getTransactionColor(item.type, item.status)} 
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800 mb-1">
              {item.description}
            </Text>
            <Text className="text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Text>
            {item.status === 'pending' && (
              <View className="bg-orange-100 rounded-full px-2 py-1 mt-1 self-start">
                <Text className="text-xs text-orange-600 font-medium">Pending</Text>
              </View>
            )}
          </View>
        </View>
        
        <View className="items-end">
          <Text 
            className={`text-lg font-bold ${
              item.type === 'credit' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {item.type === 'credit' ? '+' : '-'}₹{item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const AddMoneyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddMoneyModal}
      onRequestClose={() => setShowAddMoneyModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">Add Money</Text>
            <TouchableOpacity onPress={() => setShowAddMoneyModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-base text-gray-600 mb-4">Enter amount to add to your wallet</Text>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Amount (₹)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-lg font-semibold text-gray-800"
              placeholder="0.00"
              value={addAmount}
              onChangeText={setAddAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          
          <Text className="text-sm text-gray-500 mb-3">Quick amounts</Text>
          <View className="flex-row flex-wrap mb-6">
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                className="bg-gray-100 rounded-lg px-4 py-2 mr-2 mb-2"
                onPress={() => setAddAmount(amount.toString())}
              >
                <Text className="text-gray-700 font-medium">₹{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            className="bg-yellow-500 rounded-xl py-4 items-center"
            onPress={handleAddMoney}
          >
            <Text className="text-white font-bold text-lg">Add Money</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const WithdrawModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showWithdrawModal}
      onRequestClose={() => setShowWithdrawModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">Withdraw Money</Text>
            <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-base text-gray-600 mb-2">Enter amount to withdraw</Text>
          <Text className="text-sm text-gray-500 mb-4">Available balance: ₹{currentBalance.toFixed(2)}</Text>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Amount (₹)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-lg font-semibold text-gray-800"
              placeholder="0.00"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="ml-2 font-semibold text-blue-800">Withdrawal Info</Text>
            </View>
            <Text className="text-blue-700 text-sm">
              • Withdrawals are processed within 1-2 business days{'\n'}
              • Minimum withdrawal amount: ₹100{'\n'}
              • No charges for withdrawals above ₹500
            </Text>
          </View>
          
          <TouchableOpacity
            className="bg-red-500 rounded-xl py-4 items-center"
            onPress={handleWithdraw}
          >
            <Text className="text-white font-bold text-lg">Withdraw Money</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-red-200 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" /> 
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Account Balance</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View className="mx-4 mt-6 rounded-2xl overflow-hidden"> 
          <View className="bg-yellow-500 rounded-2xl p-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-xl font-bold">GeekLappy Wallet</Text>
              <Ionicons name="wallet" size={28} color="white" />
            </View>
            
            <View className="mb-6">
              <Text className="text-white/20 text-lg font-medium mb-1 ">Available Balance</Text>
              <Text className="text-white text-3xl font-bold">₹{currentBalance.toFixed(2)}</Text>
            </View>
            
            {pendingBalance > 0 && (
              <View className="bg-white/20 rounded-lg p-3 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-sm">Pending Balance</Text>
                  <Text className="text-white font-semibold">₹{pendingBalance.toFixed(2)}</Text>
                </View>
              </View>
            )}
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-white rounded-xl py-3 items-center"
                onPress={() => setShowAddMoneyModal(true)}
              >
                <Ionicons name="add" size={20} color="#FFBF00" />
                <Text className="text-yellow-600 font-semibold mt-1">Add Money</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-white/20 rounded-xl py-3 items-center"
                onPress={() => setShowWithdrawModal(true)}
              >
                <Ionicons name="arrow-up" size={20} color="white" />
                <Text className="text-white font-semibold mt-1">Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {/* Transaction History */}
        <View className="mx-4 mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">Transaction History</Text>
            <TouchableOpacity>
              <Text className="text-yellow-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row space-x-2">
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  className={`px-4 py-2 rounded-full ${
                    selectedFilter === option.key 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-100'
                  }`}
                  onPress={() => setSelectedFilter(option.key)}
                >
                  <Text className={`font-medium ${
                    selectedFilter === option.key 
                      ? 'text-white' 
                      : 'text-gray-600'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Transactions List */}
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="bg-white rounded-xl p-8 items-center">
                <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 text-center mt-4">No transactions found</Text>
              </View>
            }
          />
        </View>

        <View className="h-26" >
          {/* information about wallet and how it works */}
          <View className="bg-white rounded-xl p-4 mx-4 shadow-sm border border-gray-100">
            <Text className="text-gray-800 font-semibold mb-2">How GeekLappy Wallet Works</Text>
            <Text className="text-gray-600 text-sm">
              • Add money to your wallet for quick purchases{'\n'}
              • Withdraw funds to your bank account anytime{'\n'}
              • Enjoy cashback on eligible purchases{'\n'}
              • Secure and easy to use
            </Text>
            <Text className="mt-4 text-gray-500">For more details, visit our Help Center.</Text>
            <TouchableOpacity className="bg-yellow-500 rounded-xl py-2 items-center mt-4">
              <Text className="text-white font-bold text-lg">Learn More</Text>
            </TouchableOpacity>
          </View>
          
        </View> 
        
        
        <View className="h-19.40" >
          {/* Spacer to push content up */}
        </View>
      </ScrollView>

      {/* Modals */}
      <AddMoneyModal />
      <WithdrawModal />
    </SafeAreaView>
  );
};

export default AccountBalance;