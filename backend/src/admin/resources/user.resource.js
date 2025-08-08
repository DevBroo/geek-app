import { User } from '../../models/user.model.js';


const UserResource = {
            resource: User,
            options: {
                // Customize how User resource is displayed and managed
                properties: {
                    password: {
                        isVisible: { list: false, show: false, edit: true, filter: false }, // Don't show password
                    },
                    // Assuming 'role' or 'isAdmin' field for authorization
                    role: {
                        isVisible: { list: true, show: true, edit: true, filter: true },
                        availableValues: [
                            { value: 'user', label: 'User' },
                            { value: 'admin', label: 'Admin' },
                        ],
                    },
                    isAdmin: {
                        isVisible: { list: true, show: true, edit: true, filter: true },
                    },
                },
                listProperties: ['_id', 'username', 'email', 'role', 'isAdmin', 'createdAt'],
                showProperties: ['_id', 'username', 'email', 'role', 'isAdmin', 'isVerified', 'createdAt', 'updatedAt'],
                editProperties: ['username', 'email', 'password', 'role', 'isAdmin', 'isVerified'],
                filterProperties: ['username', 'email', 'role', 'isAdmin', 'isVerified', 'createdAt'],
            },

}


export { UserResource }
