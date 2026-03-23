import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import { styles } from '../styles';

const DashboardPage = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/statistics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    if (loading) return <div style={styles.card}>Loading...</div>;
    if (!stats) return <div style={styles.card}>Failed to load statistics</div>;

    const statCards = [
        { value: stats.totalFlashcards, label: 'Total Flashcards', color1: '#667eea', color2: '#764ba2', icon: 'cards' },
        { value: stats.flashcardsDueToday, label: 'Due Today', color1: '#f093fb', color2: '#f5576c', icon: 'clock' },
        { value: stats.totalReviewsToday, label: 'Reviews Today', color1: '#4facfe', color2: '#00f2fe', icon: 'check' },
        { value: stats.totalWords, label: 'Saved Words', color1: '#43e97b', color2: '#38f9d7', icon: 'book' },
        { value: stats.totalBooks, label: 'Books', color1: '#fa709a', color2: '#fee140', icon: 'library' },
        { value: stats.averageEaseFactor?.toFixed(2) || '2.50', label: 'Avg Ease Factor', color1: '#30cfd0', color2: '#330867', icon: 'chart' }
    ];

    return (
        <>
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>Dashboard</h1>
                <p style={styles.pageSubtitle}>Your learning progress at a glance</p>
            </div>
            <div style={styles.grid}>
                {statCards.map((stat, idx) => (
                    <div key={idx} style={{
                        ...styles.statCard,
                        background: `linear-gradient(135deg, ${stat.color1} 0%, ${stat.color2} 100%)`
                    }}>
                        <h3 style={styles.statValue}>{stat.value}</h3>
                        <p style={styles.statLabel}>{stat.label}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default DashboardPage;
