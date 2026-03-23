import React, { useState } from 'react';
import { API_URL } from '../services/api';
import { globalStyles, styles } from '../styles';

const LoginPage = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const endpoint = isRegister ? '/auth/register' : '/auth/login';

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                onLogin(data.accessToken, data.user);
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (error) {
            setError('Network error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <style>{globalStyles}</style>
            <div style={styles.loginCard}>
                <h1 style={styles.loginTitle}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>
                {error && <div style={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                    />
                    {isRegister && (
                        <>
                            <input
                                style={styles.input}
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                required
                            />
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                required
                            />
                        </>
                    )}
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Loading...' : (isRegister ? 'Register' : 'Login')}
                    </button>
                </form>
                <p style={styles.switchText}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <span
                        onClick={() => {setIsRegister(!isRegister); setError('');}}
                        style={styles.switchLink}
                    >
                        {isRegister ? ' Login' : ' Register'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
