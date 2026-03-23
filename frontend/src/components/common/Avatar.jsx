import React from 'react';
import { theme } from '../../styles/theme';

const sizes = {
    sm: { width: '32px', height: '32px', fontSize: theme.fontSize.sm },
    md: { width: '48px', height: '48px', fontSize: theme.fontSize.lg },
    lg: { width: '64px', height: '64px', fontSize: theme.fontSize.xl },
    xl: { width: '80px', height: '80px', fontSize: theme.fontSize.xxl },
};

const Avatar = ({
    text,
    size = 'md',
    style = {},
}) => {
    const sizeStyle = sizes[size] || sizes.md;
    const initial = text ? text.charAt(0).toUpperCase() : '?';

    return (
        <div
            style={{
                ...sizeStyle,
                background: theme.colors.accent,
                borderRadius: theme.borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textDark,
                fontWeight: theme.fontWeight.bold,
                ...style,
            }}
        >
            {initial}
        </div>
    );
};

export default Avatar;
