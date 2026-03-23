import React from 'react';
import { theme } from '../../styles/theme';
import { Avatar } from '../common';

const Header = ({ title, subtitle, user, onLogout }) => {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
        }}>
            <div>
                <h1 style={{
                    fontSize: theme.fontSize.xxl,
                    fontWeight: theme.fontWeight.bold,
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.xs,
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: theme.fontSize.sm,
                        color: theme.colors.textSecondary,
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <Avatar text={user.username || 'U'} size="md" />
                </div>
            )}
        </header>
    );
};

export default Header;
