import React from 'react';
import { theme } from '../../styles/theme';

const Card = ({
    children,
    variant = 'dark',
    padding = 'md',
    style = {},
    onClick,
    ...props
}) => {
    const paddingValues = {
        sm: theme.spacing.md,
        md: theme.spacing.lg,
        lg: theme.spacing.xl,
    };

    const backgrounds = {
        dark: theme.colors.darkCard,
        light: theme.colors.lightCard,
        transparent: 'transparent',
    };

    return (
        <div
            onClick={onClick}
            style={{
                background: backgrounds[variant] || backgrounds.dark,
                borderRadius: theme.borderRadius.lg,
                padding: paddingValues[padding] || paddingValues.md,
                cursor: onClick ? 'pointer' : 'default',
                transition: theme.transitions.normal,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
