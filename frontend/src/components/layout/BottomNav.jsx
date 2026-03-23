import React from 'react';
import { theme } from '../../styles/theme';

const getNavItems = (isAdmin) => {
    const items = [
        { id: 'dashboard', label: 'Home', icon: 'home' },
        { id: 'daily', label: 'Daily', icon: 'daily' },
        { id: 'books', label: 'Books', icon: 'book' },
        { id: 'grammar', label: 'Grammar', icon: 'grammar' },
        { id: 'dictionary', label: 'Words', icon: 'dictionary' },
        { id: 'flashcards', label: 'Study', icon: 'cards' },
    ];
    if (isAdmin) {
        items.push({ id: 'admin', label: 'Admin', icon: 'admin' });
    }
    return items;
};

const icons = {
    home: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    ),
    daily: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    book: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
    ),
    grammar: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16"/>
            <path d="M4 12h16"/>
            <path d="M4 17h10"/>
            <circle cx="19" cy="17" r="2"/>
        </svg>
    ),
    dictionary: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
    ),
    cards: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M7 8h10"/>
            <path d="M7 12h6"/>
        </svg>
    ),
    admin: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
    ),
};

const BottomNav = ({ currentPage, onNavigate, isAdmin = false }) => {
    const navItems = getNavItems(isAdmin);
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: theme.colors.darkSecondary,
            borderTop: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: `${theme.spacing.sm} 0`,
            paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
            zIndex: 1000,
        }}>
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: theme.spacing.sm,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: currentPage === item.id ? theme.colors.accent : theme.colors.textSecondary,
                        transition: theme.transitions.normal,
                        minWidth: '48px',
                    }}
                >
                    {icons[item.icon]}
                    <span style={{
                        fontSize: '10px',
                        fontWeight: currentPage === item.id ? theme.fontWeight.semibold : theme.fontWeight.normal,
                    }}>
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
