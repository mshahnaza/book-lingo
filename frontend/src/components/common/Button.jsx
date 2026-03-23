import React from 'react';
import { theme } from '../../styles/theme';

const variants = {
    primary: {
        background: theme.colors.accent,
        color: theme.colors.textDark,
    },
    secondary: {
        background: theme.colors.darkCard,
        color: theme.colors.textPrimary,
    },
    ghost: {
        background: 'transparent',
        color: theme.colors.textSecondary,
    },
    danger: {
        background: theme.colors.error,
        color: theme.colors.textPrimary,
    },
};

const sizes = {
    sm: {
        padding: '8px 16px',
        fontSize: theme.fontSize.sm,
    },
    md: {
        padding: '12px 24px',
        fontSize: theme.fontSize.md,
    },
    lg: {
        padding: '16px 32px',
        fontSize: theme.fontSize.lg,
    },
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    onClick,
    style = {},
    ...props
}) => {
    const variantStyle = variants[variant] || variants.primary;
    const sizeStyle = sizes[size] || sizes.md;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...variantStyle,
                ...sizeStyle,
                width: fullWidth ? '100%' : 'auto',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: theme.transitions.normal,
                fontFamily: 'inherit',
                ...style,
            }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
