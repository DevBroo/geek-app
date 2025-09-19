import { 
  Text, 
  View, 
  SafeAreaView, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  Modal
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import OrderActionTabs from '../../components/OrderActionTabs';

// Define interfaces for our data types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'received' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

type TabStatus = 'all' | 'received' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface TabItem {
  id: string;
  label: string;
  width?: number;
}

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);


  // Sample order data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2023-001',
      date: '2023-05-15',
      status: 'received',
      items: [
        { id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 }
      ],
      total: 1299.99
    },
    {
      id: '2',
      orderNumber: 'ORD-2023-002',
      date: '2023-06-20',
      status: 'processing',
      items: [
        { id: '2', name: 'Wireless Mouse', price: 49.99, quantity: 1 },
        { id: '3', name: 'Keyboard', price: 89.99, quantity: 1 }
      ],
      total: 139.98
    },
    {
      id: '3',
      orderNumber: 'ORD-2023-003',
      date: '2023-07-05',
      status: 'shipped',
      items: [
        { id: '4', name: 'External SSD', price: 129.99, quantity: 1 }
      ],
      total: 129.99
    },
    {
      id: '4',
      orderNumber: 'ORD-2023-004',
      date: '2023-07-10',
      status: 'out_for_delivery',
      items: [
        { id: '5', name: 'Wireless Headphones', price: 199.99, quantity: 1 }
      ],
      total: 199.99
    },
    {
      id: '5',
      orderNumber: 'ORD-2023-005',
      date: '2023-07-15',
      status: 'delivered',
      items: [
        { id: '6', name: 'Smart Watch', price: 299.99, quantity: 1 },
        { id: '7', name: 'Watch Band', price: 29.99, quantity: 2 }
      ],
      total: 359.97
    },
    {
      id: '6',
      orderNumber: 'ORD-2023-006',
      date: '2023-07-20',
      status: 'cancelled',
      items: [
        { id: '8', name: 'Bluetooth Speaker', price: 79.99, quantity: 1 }
      ],
      total: 79.99
    }
  ]);
  

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter(order => {
    // Filter by tab (status)
    if (activeTab !== 'all' && order.status !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Handle order status change
  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] } 
          : order
      )
    );
  };

  // Render an order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <View className="bg-white rounded-xl mb-5 shadow-md overflow-hidden">
      <TouchableOpacity 
        className="p-[18px]"
        onPress={() => {/* Navigate to order details */}}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-center mb-3 py-1">
          <Text className="text-base font-bold text-[#333333] max-w-[60%]">{item.orderNumber}</Text>
          <View className={`px-2.5 py-1.5 rounded-md min-w-[100px] items-center ${
            item.status === 'delivered' ? 'bg-[#E8F5E9]' : 
            item.status === 'shipped' ? 'bg-[#E0F7FA]' :
            item.status === 'out_for_delivery' ? 'bg-[#F3E5F5]' :
            item.status === 'processing' ? 'bg-[#FFF3E0]' :
            item.status === 'cancelled' ? 'bg-[#FFEBEE]' : 
            'bg-[#E3F2FD]'
          }`}>
            <Text className="text-[13px] font-semibold text-center">
              {item.status === 'out_for_delivery' 
                ? 'Out for Delivery'
                : item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-4 py-1">
          <Text className="text-sm text-[#666666] font-medium">Order Date: {item.date}</Text>
          <Text className="text-sm text-[#666666] font-medium">{item.items.length} item(s)</Text>
        </View>
        
        <View className="border-t border-[#EEEEEE] pt-4 mt-1">
          {item.items.map(product => (
            <View key={product.id} className="flex-row justify-between items-center mb-3 py-1 px-0.5">
              <Text className="flex-2 text-[15px] text-[#333333] font-medium">{product.name}</Text>
              <Text className="flex-1 text-sm text-[#666666] text-center font-medium">x{product.quantity}</Text>
              <Text className="flex-1 text-[15px] text-[#333333] text-right font-semibold">${product.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        
        <View className="flex-row justify-end items-center mt-4 pt-4 pb-1 border-t border-[#EEEEEE]">
          <Text className="text-base font-semibold mr-2.5 text-[#333333]">Total:</Text>
          <Text className="text-lg font-bold text-[#F9A826]">${item.total.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
      
      {/* Order Action Tabs */}
      <OrderActionTabs 
        order={item} 
        onOrderStatusChange={handleOrderStatusChange}
      />
    </View>
  );

  // Filter Modal
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-5">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-bold">Filter Orders</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View className="mb-5">
            <Text className="text-base font-semibold mb-3">Order Status</Text>
            <View className="flex-row flex-wrap">
              {['all', 'received', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                <TouchableOpacity 
                  key={status}
                  className={`bg-[#F5F5F5] px-3 py-2 rounded-full mr-2 mb-2 ${
                    statusFilter === status ? 'bg-[#F9A826]' : ''
                  }`}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text className={`${
                    statusFilter === status ? 'text-white font-medium' : 'text-[#666666]'
                  }`}>
                    {status === 'all' 
                      ? 'All' 
                      : status === 'out_for_delivery'
                        ? 'Out for Delivery'
                        : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View className="mb-5">
            <Text className="text-base font-semibold mb-3">Time Period</Text>
            <View className="flex-row flex-wrap">
              {[
                { id: 'all', label: 'All Time' },
                { id: '30days', label: 'Last 30 Days' },
                { id: '6months', label: 'Last 6 Months' },
                { id: '1year', label: 'Last Year' }
              ].map(period => (
                <TouchableOpacity 
                  key={period.id}
                  className={`bg-[#F5F5F5] px-3 py-2 rounded-full mr-2 mb-2 ${
                    timeFilter === period.id ? 'bg-[#F9A826]' : ''
                  }`}
                  onPress={() => setTimeFilter(period.id)}
                >
                  <Text className={`${
                    timeFilter === period.id ? 'text-white font-medium' : 'text-[#666666]'
                  }`}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View className="flex-row justify-between mt-5">
            <TouchableOpacity 
              className="flex-1 py-3 items-center border border-[#CCCCCC] rounded-lg mr-2"
              onPress={() => {
                setStatusFilter('all');
                setTimeFilter('all');
              }}
            >
              <Text className="text-[#666666] text-base font-medium">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-[#F9A826] py-3 items-center rounded-lg ml-2"
              onPress={() => {
                // Apply filters
                setFilterModalVisible(false);
              }}
            >
              <Text className="text-white text-base font-medium">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // No Orders View
  const NoOrdersView = () => (
    <View className="flex-1 justify-center items-center p-6">
      <Image 
        source={require('../../assets/images/mouse1.jpg')} 
        className="w-[200px] h-[200px] mb-6"
        resizeMode="contain"
      />
      <Text className="text-xl font-bold text-[#333333] mb-2">No Orders Found</Text>
      <Text className="text-base text-[#666666] text-center mb-6">
        Currently you do not have any order.
      </Text>
      <TouchableOpacity className="bg-[#F9A826] px-6 py-3 rounded-lg">
        <Text className="text-white text-base font-semibold">Shop Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-[18px] py-4 bg-white border-b border-[#EEEEEE] mt-[30px]">
        <TouchableOpacity className="p-1.5">
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-[22px] font-bold text-[#333333]">Orders</Text>
        <TouchableOpacity 
          className="p-1.5"
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {orders.length === 0 ? (
        <NoOrdersView />
      ) : (
        <>
          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-[10px] mx-4 my-3.5 px-4 py-3 border border-[#EEEEEE] shadow-sm">
            <Ionicons name="search-outline" size={20} color="#999" className="mr-2.5" />
            <TextInput
              className="flex-1 text-base text-[#333333] py-0.5"
              placeholder="Search orders"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <View className="flex-row bg-white border-b border-[#EEEEEE] items-center">
              {[
                { id: 'all', label: 'All' },
                { id: 'received', label: 'Received' },
                { id: 'processing', label: 'Processing' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'out_for_delivery', label: 'Out for Delivery', width: 120 },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' }
              ].map((tab: TabItem) => (
                <TouchableOpacity
                  key={tab.id}
                  className={`py-2 px-3 mr-2 min-w-[60px] min-h-[60px] justify-center   ${
                    activeTab === tab.id as TabStatus ? 'border-b-3 border-[#F9A826]' : ''
                  }`}
                  style={tab.width ? { minWidth: tab.width } : {}}
                  onPress={() => setActiveTab(tab.id as TabStatus)}
                >
                  <Text 
                    className={`text-14px font-medium text-center tracking-wider ${
                      activeTab === tab.id as TabStatus ? 'text-[#F9A826] font-bold' : 'text-[#555555]'
                    }`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Orders List */}
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item: Order) => item.id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="p-6 items-center">
                <Text className="text-base text-[#999999]">No orders found</Text>
              </View>
            }
          />
        </>
      )}
      
      {/* Filter Modal */}
      <FilterModal />
      
    </SafeAreaView>
  );
};

export default Orders;