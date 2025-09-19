import { fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

export const authProvider = {
    login: ({ username, password }) => {
        // Simulate a successful login for any username and password
        // with two different roles.
        if (username === 'admin' && password === 'password') {
            localStorage.setItem('role', 'admin');
            return Promise.resolve();
        }
        if (username === 'viewer' && password === 'password') {
            localStorage.setItem('role', 'viewer');
            return Promise.resolve();
        }
        return Promise.reject(new Error('Invalid username or password'));
    },
    logout: () => {
        localStorage.removeItem('role');
        return Promise.resolve();
    },
    checkAuth: () => {
        return localStorage.getItem('role') ? Promise.resolve() : Promise.reject();
    },
    getIdentity: () => {
        const role = localStorage.getItem('role');
        return Promise.resolve({
            id: role,
            fullName: role === 'admin' ? 'Admin User' : 'Viewer User',
        });
    },
    getPermissions: () => {
        const role = localStorage.getItem('role');
        return Promise.resolve(role);
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('role');
            return Promise.reject();
        }
        return Promise.resolve();
    },
};