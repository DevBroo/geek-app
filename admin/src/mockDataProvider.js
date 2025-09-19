// Function to generate sample data with hashed passwords
import bcrypt from 'bcryptjs';

// Data store (in-memory for simplicity)
const products = [];
const users = [];
const orders = [];
let productIdCounter = 1;
let userIdCounter = 1;
let orderIdCounter = 1;


export const generateSampleData = async () => {
    // Sample Users with hashed passwords
    const adminPassword = await bcrypt.hash('password', 10);
    const viewerPassword = await bcrypt.hash('password', 10);
    users.push({ id: userIdCounter++, name: 'Admin User', email: 'admin@example.com', role: 'admin', password: adminPassword });
    users.push({ id: userIdCounter++, name: 'Viewer User', email: 'viewer@example.com', role: 'viewer', password: viewerPassword });

    // Sample Products
    products.push({
        id: productIdCounter++,
        name: 'Classic White T-Shirt',
        description: 'A comfortable and stylish white t-shirt.',
        price: 25.00,
        stock: 100,
        image: { src: `http://localhost:${port}/uploads/placeholder.png`, title: 'Placeholder Image' },
        attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: 'M' }]
    });
    products.push({
        id: productIdCounter++,
        name: 'Cozy Knit Sweater',
        description: 'Perfect for a chilly day.',
        price: 60.00,
        stock: 50,
        image: { src: `http://localhost:${port}/uploads/placeholder.png`, title: 'Placeholder Image' },
        attributes: [{ name: 'Color', value: 'Gray' }, { name: 'Material', value: 'Wool' }]
    });

    // Sample Orders
    orders.push({
        id: orderIdCounter++,
        userId: users[0].id,
        orderDate: new Date('2024-05-15T10:00:00Z'),
        total: 25.00,
        status: 'Processing'
    });
    orders.push({
        id: orderIdCounter++,
        userId: users[1].id,
        orderDate: new Date('2024-05-16T12:30:00Z'),
        total: 60.00,
        status: 'Shipped'
    });
};


export const mockDataProvider = {
    getList: (resource) => Promise.resolve({ data: mockData[resource], total: mockData[resource].length }),
    getOne: (resource, params) => Promise.resolve({ data: mockData[resource].find(item => item.id === params.id) }),
    create: (resource, params) => {
        const newId = Math.max(...mockData[resource].map(item => item.id)) + 1;
        const newItem = { ...params.data, id: newId };
        mockData[resource].push(newItem);
        return Promise.resolve({ data: newItem });
    },
    update: (resource, params) => {
        const index = mockData[resource].findIndex(item => item.id === params.id);
        mockData[resource][index] = { ...mockData[resource][index], ...params.data };
        return Promise.resolve({ data: mockData[resource][index] });
    },
    delete: (resource, params) => {
        const index = mockData[resource].findIndex(item => item.id === params.id);
        const deletedItem = mockData[resource].splice(index, 1)[0];
        return Promise.resolve({ data: deletedItem });
    },
    getMany: (resource, params) => Promise.resolve({ data: params.ids.map(id => mockData[resource].find(item => item.id === id)) }),
    getManyReference: (resource, params) => Promise.resolve({ data: [], total: 0 }),
    updateMany: () => Promise.resolve({ data: [] }),
    deleteMany: () => Promise.resolve({ data: [] }),
};