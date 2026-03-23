// API Configuration
export const API_URL = 'http://localhost:8080/api';

// API Helper
export const api = {
    headers: (token) => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }),
    headersForm: (token) => ({
        'Authorization': `Bearer ${token}`
    })
};
