// src/Dashboard.tsx
// import { Card, CardContent, CardHeader } from '@mui/material';

// export const Dashboard = () => (
//     <Card>
//         <CardHeader title="Welcome to the Admin Panel" />
//         <CardContent>
//             Your e-commerce dashboard. You can add charts and statistics here.
//         </CardContent>
//     </Card>
// );

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';

const Dashboard = () => (
    <Card>
        <CardHeader title="Welcome to the Admin Dashboard" />
        <CardContent>
            <p>Here you can add widgets to display key application metrics, such as:</p>
            <ul>
                <li>Total Orders</li>
                <li>Total Products</li>
                <li>Recent Reviews</li>
                <li>New User Signups</li>
            </ul>
            <p>This is your central hub for quick insights.</p>
        </CardContent>
    </Card>
);

export default Dashboard;