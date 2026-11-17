import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

const BG: Record<string, string> = {
  primary: '#0e639c', secondary: '#3c3c3c', danger: '#6e1414', ghost: 'transparent',
};

export function Button({ variant = 'primary', size = 'md', style, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        background: BG[variant],
        color: '#fff',
        border: variant === 'ghost' ? '1px solid #555' : 'none',
        padding: size === 'sm' ? '3px 10px' : '6px 16px',
        borderRadius: 4,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontSize: size === 'sm' ? 11 : 13,
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
