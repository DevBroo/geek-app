// backend/src/admin/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs'; // Import ApiClient from AdminJS
import {
    Box,
    H1,
    H2,
    Text,
    Badge,
    Loader,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardContent,
    CardHeader,
    Icon, // For icons
} from '@adminjs/design-system';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const api = new ApiClient(); // Initialize AdminJS API client

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch data from your custom backend API endpoint
                const response = await api.get('/admin/dashboard/stats');
                if (response.data && response.data.success) {
                    setStats(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch dashboard data.');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'An error occurred while fetching dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box variant="card" p="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader />
                <Text ml="default">Loading Dashboard Data...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box variant="card" p="xl" style={{ color: 'red' }}>
                <Text variant="text">Error: {error}</Text>
            </Box>
        );
    }

    if (!stats) {
        return (
            <Box variant="card" p="xl">
                <Text variant="text">No dashboard data available.</Text>
            </Box>
        );
    }

    // Prepare data for charts
    const orderStatusChartData = stats.orderStatusDistribution.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.count
    }));

    const paymentMethodChartData = stats.paymentMethodDistribution.map(item => ({
        name: item.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: item.count
    }));

    return (
        <Box variant="card" p="xl">
            <H1>Dashboard Overview</H1>

            {/* Summary Cards */}
            <Box display="grid" gridTemplateColumns={['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr']} gridGap="20px" mb="xl">
                <Card variant="card">
                    <CardHeader>
                        <Icon icon="User" mr="default" />
                        <Text variant="text" fontWeight="bold">Total Users</Text>
                    </CardHeader>
                    <CardContent>
                        <H2>{stats.summary.totalUsers}</H2>
                    </CardContent>
                </Card>
                <Card variant="card">
                    <CardHeader>
                        <Icon icon="Package" mr="default" />
                        <Text variant="text" fontWeight="bold">Total Products</Text>
                    </CardHeader>
                    <CardContent>
                        <H2>{stats.summary.totalProducts}</H2>
                    </CardContent>
                </Card>
                <Card variant="card">
                    <CardHeader>
                        <Icon icon="ShoppingCart" mr="default" />
                        <Text variant="text" fontWeight="bold">Total Orders</Text>
                    </CardHeader>
                    <CardContent>
                        <H2>{stats.summary.totalOrders}</H2>
                    </CardContent>
                </Card>
                <Card variant="card">
                    <CardHeader>
                        <Icon icon="DollarSign" mr="default" />
                        <Text variant="text" fontWeight="bold">Total Revenue</Text>
                    </CardHeader>
                    <CardContent>
                        <H2>₹{stats.summary.totalRevenue}</H2>
                    </CardContent>
                </Card>
                <Card variant="card">
                    <CardHeader>
                        <Icon icon="Wallet" mr="default" />
                        <Text variant="text" fontWeight="bold">Overall Wallet Balance</Text>
                    </CardHeader>
                    <CardContent>
                        <H2>₹{stats.summary.overallWalletBalance}</H2>
                    </CardContent>
                </Card>
                <Card variant="card">
                    <CardHeader>
                        <Icon icon="HelpCircle" mr="default" />
                        <Text variant="text" fontWeight="bold">Unanswered FAQs</Text>
                    </CardHeader>
                    <CardContent>
                        <H2>{stats.summary.unansweredFAQs}</H2>
                        {stats.summary.unansweredFAQs > 0 && (
                            <Button
                                as="a"
                                href="/admin/resources/FrequentlyAskedQuestion?filters.isAnswered=false"
                                size="sm"
                                variant="primary"
                            >
                                View Unanswered
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Charts Section */}
            <Box display="grid" gridTemplateColumns={['1fr', '1fr', '1fr 1fr']} gridGap="20px" mb="xl">
                <Card variant="card">
                    <CardHeader>
                        <Text variant="text" fontWeight="bold">Order Status Distribution</Text>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {orderStatusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card variant="card">
                    <CardHeader>
                        <Text variant="text" fontWeight="bold">Payment Method Distribution</Text>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentMethodChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {paymentMethodChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            <Box display="grid" gridTemplateColumns={['1fr']} gridGap="20px" mb="xl">
                <Card variant="card">
                    <CardHeader>
                        <Text variant="text" fontWeight="bold">Monthly Revenue Trend (Last 6 Months)</Text>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={stats.monthlyRevenue}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* Recent Transactions Table */}
            <Box mb="xl">
                <Card variant="card">
                    <CardHeader>
                        <Text variant="text" fontWeight="bold">Recent Transactions</Text>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Gateway</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.recentTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} style={{ textAlign: 'center' }}>No recent transactions.</TableCell>
                                    </TableRow>
                                ) : (
                                    stats.recentTransactions.map((tx) => (
                                        <TableRow key={tx._id}>
                                            <TableCell>
                                                {tx.user ? (
                                                    <Link to={`/admin/resources/User/records/${tx.user._id}/show`}>
                                                        {tx.user.name || tx.user.email}
                                                    </Link>
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={tx.type === 'deposit' || tx.type === 'refund_to_wallet' ? 'success' : 'danger'}
                                                >
                                                    {tx.type === 'deposit' || tx.type === 'refund_to_wallet' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{tx.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'info' : 'danger'}
                                                >
                                                    {tx.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{tx.paymentGateway.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                                            <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Dashboard;