import * as React from 'react';
import { Admin, Resource, TextInput, required, useLogin } from 'react-admin';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Button, Card, CardContent, CardHeader, Typography, Container, CircularProgress,  TextField as MuiTextField  } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { blueGrey, green } from '@mui/material/colors';
import { useState, useEffect } from 'react';

/// --- Custom Login Page ---
export const MyLoginPage = () => {
    const login = useLogin();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        login({ username, password })
            .then(() => {
                window.location.reload();
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Card>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                    }}
                >
                    <Box sx={{ mb: 2 }}>
                        <LockIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <MuiTextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username (admin@example.com or viewer@example.com)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                        <MuiTextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password (password)"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                        {error && (
                            <Typography color="error" variant="body2" align="center">
                                {error}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Card>
        </Container>
    );
};