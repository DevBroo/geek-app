import { Transaction } from "../../models/transaction.model.js"

const transactionResource = {
    resource: Transaction, // New/Updated Transaction model
                options: {
                    properties: {
                        user: { isVisible: { list: true, show: true, edit: false, filter: true } },
                        amount: { type: 'number', min: 0 },
                        type: {
                            availableValues: [
                                { value: 'deposit', label: 'Deposit' },
                                { value: 'withdrawal', label: 'Withdrawal' },
                                { value: 'order_payment', label: 'Order Payment' },
                                { value: 'refund_to_wallet', label: 'Refund to Wallet' },
                            ]
                        },
                        status: {
                            availableValues: [
                                { value: 'pending', label: 'Pending' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'failed', label: 'Failed' },
                                { value: 'refund_initiated', label: 'Refund Initiated' },
                                { value: 'refunded', label: 'Refunded' },
                            ]
                        },
                        paymentGateway: {
                            availableValues: [
                                { value: 'paytm_pg', label: 'Paytm Payment Gateway' },
                                { value: 'paytm_payouts', label: 'Paytm Payouts' },
                                { value: 'wallet_internal', label: 'Internal Wallet' },
                                { value: 'cod', label: 'Cash on Delivery' },
                            ]
                        },
                        gatewayOrderId: { isVisible: { list: true, show: true, edit: false, filter: true } },
                        gatewayTxnId: { isVisible: { list: true, show: true, edit: false, filter: true } },
                        gatewayPayoutId: { isVisible: { list: true, show: true, edit: false, filter: true } },
                        orderRef: { isVisible: { list: true, show: true, edit: false, filter: true } },
                        withdrawalDetails: {
                            type: 'mixed', // To display the object, will be decrypted by model hook
                            isVisible: { list: false, show: true, edit: false, filter: false },
                        },
                        gatewayResponse: {
                            type: 'mixed', // To display the full JSON response
                            isVisible: { list: false, show: true, edit: false, filter: false },
                        },
                    },
                    listProperties: [
                        '_id', 'user', 'amount', 'type', 'status', 'paymentGateway', 'createdAt'
                    ],
                    showProperties: [
                        '_id', 'user', 'amount', 'type', 'status', 'paymentGateway',
                        'gatewayOrderId', 'gatewayTxnId', 'gatewayPayoutId', 'orderRef',
                        'withdrawalDetails', 'reason', 'gatewayResponse', 'createdAt', 'updatedAt'
                    ],
                    editProperties: [
                        'status', // Admin might update status if manual intervention required
                        'reason',
                        // Do NOT allow editing amount, type, gateway IDs directly
                    ],
                    filterProperties: [
                        'user', 'type', 'status', 'paymentGateway', 'createdAt', 'amount', 'gatewayOrderId'
                    ],
                },
}

export {transactionResource}