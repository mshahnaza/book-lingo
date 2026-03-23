import React from 'react';
import { theme } from '../../styles/theme';
import BottomNav from './BottomNav';

const Layout = ({ children, currentPage, onNavigate, showNav = true, isAdmin = false }) => {
    return (
        <div style={{
            minHeight: '100vh',
            background: theme.colors.dark,
            paddingBottom: showNav ? '80px' : '0',
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: theme.spacing.lg,
            }}>
                {children}
            </div>
            {showNav && (
                <BottomNav currentPage={currentPage} onNavigate={onNavigate} isAdmin={isAdmin} />
            )}
        </div>
    );
};

export default Layout;
