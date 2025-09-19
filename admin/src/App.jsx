// src/App.tsx
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
// import dataProvider from './dataProvider.js';
import { UserList, UserEdit, UserCreate } from './pages/users.jsx';
import { ProductList, ProductEdit, ProductCreate } from './pages/products.jsx';
import { ReviewList, ReviewShow } from './pages/reviews.jsx';
import { FaqList, FaqEdit, FaqCreate } from './pages/faqs.jsx';
import { CategoryList, CategoryEdit, CategoryCreate } from './pages/categories.jsx';
import { InventoryList, InventoryEdit } from './pages/inventory.jsx';
import { NotificationList, NotificationShow } from './pages/notifications.jsx';
import { OrderList } from './pages/orders.jsx';
import Dashboard from './pages/dashboard.jsx';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blueGrey, green } from '@mui/material/colors';
import {mockDataProvider} from './mockDataProvider.js';
import { authProvider } from './authProvider.js';
import { CssBaseline } from '@mui/material';
import { MyLoginPage } from './pages/login.jsx';

// ... (your existing theme and dataProvider)

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: blueGrey[500],
        },
        secondary: {
            main: green[500],
        },
    },
});


const App = () => (
    <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Admin
            authProvider={authProvider}
            dataProvider={mockDataProvider}
            loginPage={MyLoginPage}
            dashboard={Dashboard}
        >
            <Resource
                name="products"
                list={ProductList}
                edit={ProductEdit}
                create={ProductCreate}
            />
            <Resource name="users" list={UserList} />
            <Resource name="orders" list={OrderList} />
            <Resource name="reviews" list={ReviewList} show={ReviewShow} />
            <Resource name="faqs" list={FaqList} edit={FaqEdit} create={FaqCreate} />
            <Resource name="categories" list={CategoryList} edit={CategoryEdit} create={CategoryCreate} />
            <Resource name="inventory" list={InventoryList} edit={InventoryEdit} />
            <Resource name="notifications" list={NotificationList} show={NotificationShow} />
        </Admin>
    </ThemeProvider>
);

export default App;
