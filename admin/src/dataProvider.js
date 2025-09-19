import { fetchUtils, resource } from 'react-admin';

// --- Data Provider with Authorization Header ---
// This provider is a custom version that adds the Authorization header to all requests.
export const dataProvider = {
    getList: (resource, params) => {
        const token = localStorage.getItem('token');
        const headers = new Headers({ 'Authorization': `Bearer ${token}` });
        return fetch(`${API_URL}/${resource}`, { headers })
            .then(res => {
                return res.json().then(data => ({
                    data,
                    total: parseInt(res.headers.get('X-Total-Count'), 10),
                }));
            });
    },
    getOne: (resource, params) => {
        const token = localStorage.getItem('token');
        const headers = new Headers({ 'Authorization': `Bearer ${token}` });
        return fetch(`${API_URL}/${resource}/${params.id}`, { headers })
            .then(res => res.json().then(data => ({ data })));
    },
    create: (resource, params) => {
        const token = localStorage.getItem('token');
        const headers = new Headers({ 'Authorization': `Bearer ${token}` });
        return fetch(`${API_URL}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
            headers,
        }).then(res => res.json().then(data => ({ data })));
    },
    update: (resource, params) => {
        const token = localStorage.getItem('token');
        const headers = new Headers({ 'Authorization': `Bearer ${token}` });
        return fetch(`${API_URL}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
            headers,
        }).then(res => res.json().then(data => ({ data })));
    },
    delete: (resource, params) => {
        const token = localStorage.getItem('token');
        const headers = new Headers({ 'Authorization': `Bearer ${token}` });
        return fetch(`${API_URL}/${resource}/${params.id}`, {
            method: 'DELETE',
            headers,
        }).then(res => res.json().then(data => ({ data })));
    },
    getMany: (resource, params) => Promise.resolve({ data: [] }),
    getManyReference: (resource, params) => Promise.resolve({ data: [], total: 0 }),
    updateMany: (resource, params) => Promise.resolve({ data: [] }),
    deleteMany: (resource, params) => Promise.resolve({ data: [] }),
};