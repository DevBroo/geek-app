// backend/src/admin/components/OrderProductList.jsx

import React from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Text } from '@adminjs/design-system';
import { Link } from 'react-router-dom'; // For linking to product details within AdminJS

const OrderProductList = (props) => {
  // `record` contains the data of the current Order being viewed/edited
  const { record, property } = props;

  // Access the 'products' array from the record parameters
  // Ensure 'products' exists and is an array
  const products = record.params.products || [];

  if (products.length === 0) {
    return <Box mt="xl">No products in this order.</Box>;
  }

  return (
    <Box mt="xl">
      <Text variant="text" mb="default" fontWeight="bold">Order Products:</Text>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Price/Unit</TableCell>
            <TableCell>Total Price</TableCell>
            <TableCell>Image</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((item, index) => (
            <TableRow key={item.product ? item.product + '_' + index : index}>
              <TableCell>
                {/* If product ID exists, create a link to the Product resource show page */}
                {item.product ? (
                  <Link to={`/admin/resources/Product/records/${item.product}/show`}>
                    <Text>{item.name}</Text>
                  </Link>
                ) : (
                  <Text>{item.name || 'N/A'}</Text>
                )}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>₹{item.price ? item.price.toFixed(2) : '0.00'}</TableCell>
              <TableCell>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</TableCell>
              <TableCell>
                {item.image && item.image.url && (
                  <img src={item.image.url} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default OrderProductList;