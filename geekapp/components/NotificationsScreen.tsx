import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system' | 'payment';
  image?: any;
}

interface NotificationsScreenProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationPress: (notification: Notification) => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationPress
}) => {
  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Ionicons name="cube" size={24} color="#FFBF00" />;
      case 'promo':
        return <Ionicons name="pricetag" size={24} color="#007AFF" />;
      case 'system':
        return <Ionicons name="information-circle" size={24} color="#FF9500" />;
      case 'payment':
        return <Ionicons name="card" size={24} color="#4CD964" />;
      default:
        return <Ionicons name="notifications" size={24} color="#FFBF00" />;
    }
  };

  // Render a notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-100 flex-row items-center ${!item.isRead ? 'bg-yellow-50' : ''}`}
      onPress={() => onNotificationPress(item)}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
        {getNotificationIcon(item.type)}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-xs text-gray-500">{item.time}</Text>
        </View>
        <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      {!item.isRead && (
        <View className="w-3 h-3 rounded-full bg-red-500 ml-2" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Notifications</Text>
          </View>
          <TouchableOpacity onPress={onMarkAllAsRead}>
            <Text className="text-sm text-yellow-500 font-medium">Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Count */}
        {unreadCount > 0 && (
          <View className="bg-yellow-50 px-4 py-2 border-b border-yellow-100">
            <Text className="text-sm text-yellow-700">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Ionicons name="notifications-off-outline" size={80} color="#CCCCCC" />
            <Text className="text-lg font-semibold text-gray-800 mt-4">No Notifications</Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              You don't have any notifications yet. We'll notify you when something important happens.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default NotificationsScreen;