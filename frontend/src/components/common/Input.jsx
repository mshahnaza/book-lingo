import React from 'react';
import { theme } from '../../styles/theme';

const Input = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    style = {},
    ...props
}) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.colors.darkSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.textPrimary,
                fontSize: theme.fontSize.md,
                fontFamily: 'inherit',
                outline: 'none',
                transition: theme.transitions.normal,
                ...style,
            }}
            {...props}
        />
    );
};

export default Input;
