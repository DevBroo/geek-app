// Real-time Connection Status Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';

interface ConnectionStatusProps {
  showDetails?: boolean;
  style?: any;
}

export const RealTimeConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  style 
}) => {
  const { 
    connected, 
    connecting, 
    error, 
    reconnectAttempts, 
    reconnect,
    unreadCount 
  } = useWebSocket();

  const getStatusColor = () => {
    if (connected) return '#22C55E'; // Green
    if (connecting) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getStatusText = () => {
    if (connected) return 'Connected';
    if (connecting) return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (connected) return '🟢';
    if (connecting) return '🟡';
    return '🔴';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {showDetails && (
        <View style={styles.details}>
          {error && (
            <Text style={styles.errorText}>Error: {error}</Text>
          )}
          
          {reconnectAttempts > 0 && (
            <Text style={styles.reconnectText}>
              Reconnect attempts: {reconnectAttempts}
            </Text>
          )}
          
          {!connected && (
            <TouchableOpacity 
              style={styles.reconnectButton}
              onPress={reconnect}
            >
              <Text style={styles.reconnectButtonText}>🔄 Reconnect</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  notificationBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginBottom: 4,
  },
  reconnectText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  reconnectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  reconnectButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default RealTimeConnectionStatus;