import { Components } from '../components.js';
import { Order } from '../../models/orders.model.js';

const OrdersResource = {
    resource: Order,
                options: {
                    properties: {
                        paytmTxnToken: { isVisible: { list: false, show: true, edit: false, filter: false } },
                        paytmResponse: { isVisible: { list: false, show: true, edit: false, filter: false } },
                        // New order status enum
                        status: { // Renamed from 'orderStatus' to 'status' as per your schema
                            isVisible: { list: true, show: true, edit: true, filter: true },
                            availableValues: [
                                { value: 'pending', label: 'Pending' },
                                { value: 'processing', label: 'Processing' },
                                { value: 'shipped', label: 'Shipped' },
                                { value: 'delivered', label: 'Delivered' },
                                { value: 'returned', label: 'Returned' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ],
                        },
                        // `isReturned` and `cancelled` removed as they are redundant with `status`
                        // `shippingInfo` fields are now directly editable
                        'shippingInfo.address': { isVisible: { list: false, show: true, edit: true, filter: false } },
                        'shippingInfo.city': { isVisible: { list: false, show: true, edit: true, filter: false } },
                        'shippingInfo.state': { isVisible: { list: false, show: true, edit: true, filter: false } },
                        'shippingInfo.pinCode': { isVisible: { list: false, show: true, edit: true, filter: false } },
                        'shippingInfo.phoneNo': { isVisible: { list: false, show: true, edit: true, filter: false } },
                        products: {
                            components: {
                                edit: Components.OrderProductList,
                            }
                        },
                    },
                    listProperties: [
                        '_id', 'user', 'totalAmount', 'paymentStatus', 'status', 'createdAt', 'updatedAt'
                    ],
                    showProperties: [
                        '_id', 'user', 'products', 'shippingInfo.address', 'shippingInfo.city',
                        'shippingInfo.state', 'shippingInfo.pinCode', 'shippingInfo.phoneNo',
                        'totalAmount', 'tax', 'shippingCharges', 'paymentMethod', 'paymentStatus',
                        'paytmOrderId', 'paytmTxnId', 'paidAt', 'status', 'deliveryDate', 'deliveredAt',
                        'returnedAt', 'returnedReason', 'createdAt', 'updatedAt'
                    ],
                    editProperties: [
                        'status', // Allow editing the primary order status
                        'shippingInfo.address',
                        'shippingInfo.city',
                        'shippingInfo.state',
                        'shippingInfo.pinCode',
                        'shippingInfo.phoneNo',
                        // Do NOT allow editing products, totalAmount, payment details directly
                    ],
                    filterProperties: [
                        'user', 'paymentStatus', 'status', 'createdAt', 'totalAmount', 'paymentMethod'
                    ],
                },
}

export { OrdersResource }