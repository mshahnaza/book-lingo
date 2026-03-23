// Minimalist Theme - Based on reference design
export const theme = {
    colors: {
        // Primary colors
        dark: '#1a1d29',
        darkSecondary: '#252836',
        darkCard: '#2d3142',

        // Light theme
        light: '#ffffff',
        lightSecondary: '#f8f9fa',
        lightCard: '#ffffff',

        // Accent
        accent: '#e8a87c',
        accentLight: '#f6c89f',

        // Text
        textPrimary: '#ffffff',
        textSecondary: '#9ca3af',
        textDark: '#1a1d29',
        textMuted: '#6b7280',

        // Status
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa',

        // Borders
        border: '#374151',
        borderLight: '#e5e7eb',
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
    },

    borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
    },

    fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '24px',
        xxl: '32px',
        hero: '48px',
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        md: '0 4px 12px rgba(0, 0, 0, 0.15)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.2)',
    },

    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
    },
};

export default theme;
