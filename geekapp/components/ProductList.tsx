// Example Frontend Component using the optimized data flow
import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  category?: string;
  onProductPress?: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ category, onProductPress }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    refetch, 
    loadMore, 
    searchProducts, 
    clearError 
  } = useProducts({ 
    category, 
    autoLoad: true, 
    enableCache: true 
  });

  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      await searchProducts(searchKeyword.trim());
    } else {
      await refetch();
    }
  };

  const handleLoadMore = async () => {
    if (pagination?.hasNext && !loading) {
      await loadMore();
    }
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      onPress={() => onProductPress?.(item._id)}
    />
  );

  const renderFooter = () => {
    if (!pagination?.hasNext) return null;
    
    return (
      <TouchableOpacity 
        onPress={handleLoadMore}
        style={{ padding: 16, alignItems: 'center' }}
        disabled={loading}
      >
        <Text style={{ color: '#007AFF' }}>
          {loading ? 'Loading...' : 'Load More'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={{ padding: 16, backgroundColor: '#FFF3CD', margin: 16, borderRadius: 8 }}>
        <Text style={{ color: '#856404', marginBottom: 8 }}>{error}</Text>
        <TouchableOpacity 
          onPress={() => {
            clearError();
            refetch();
          }}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text style={{ color: '#007AFF' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>
        No products found
      </Text>
      {searchKeyword ? (
        <TouchableOpacity onPress={() => {
          setSearchKeyword('');
          refetch();
        }}>
          <Text style={{ color: '#007AFF' }}>Clear search</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={refetch}>
          <Text style={{ color: '#007AFF' }}>Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={{ 
        flexDirection: 'row', 
        padding: 16, 
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }}>
        <TextInput
          style={{ 
            flex: 1, 
            borderWidth: 1, 
            borderColor: '#ddd', 
            borderRadius: 8, 
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 8
          }}
          placeholder="Search products..."
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          onPress={handleSearch}
          style={{ 
            backgroundColor: '#007AFF',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            justifyContent: 'center'
          }}
          disabled={loading}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {loading ? '...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {renderError()}

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={['#007AFF']}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />

      {/* Pagination Info */}
      {pagination && (
        <View style={{ 
          padding: 12, 
          backgroundColor: '#f8f9fa', 
          alignItems: 'center',
          borderTopWidth: 1,
          borderColor: '#e9ecef'
        }}>
          <Text style={{ color: '#666', fontSize: 12 }}>
            Page {pagination.page} of {pagination.pages} • {pagination.total} total products
          </Text>
        </View>
      )}
    </View>
  );
};