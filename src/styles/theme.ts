import { DefaultTheme } from 'styled-components/native';

export const lightTheme: DefaultTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    primary: '#2563EB',
    border: '#E2E8F0',
    card: '#F8FAFC',
    danger: '#b00020',
  },
};

export const darkTheme: DefaultTheme = {
  colors: {
    background: '#0B1220',
    text: '#E2E8F0',
    muted: '#94A3B8',
    primary: '#60A5FA',
    border: '#1F2937',
    card: '#0F172A',
    danger: '#EF4444',
  },
};

export type AppTheme = typeof lightTheme;

