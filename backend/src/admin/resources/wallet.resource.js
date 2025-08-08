import { Wallet } from '../../models/wallet.model.js';

const walletResource = {
    resource: Wallet, // Updated Wallet model
                options: {
                    properties: {
                        // Only user and balance are relevant now
                        balance: { type: 'number', min: 0 },
                    },
                    listProperties: ['_id', 'user', 'balance', 'createdAt', 'updatedAt'],
                    showProperties: ['_id', 'user', 'balance', 'createdAt', 'updatedAt'],
                    editProperties: ['balance'], // Admin can manually adjust balance (with caution)
                    filterProperties: ['user', 'balance', 'createdAt'],
                },
}

export { walletResource }

