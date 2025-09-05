// components/Input/Input.tsx
'use client';

import { memo, forwardRef, useState } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  containerClassName?: string;
};

const Input = memo(
  forwardRef<HTMLInputElement, Props>(function Input(
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      size = 'md',
      fullWidth = false,
      disabled = false,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const baseClasses =
      'block bg-brand-gray-dark border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-black placeholder-brand-gray';

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const borderColors = error
      ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/50'
      : isFocused
      ? 'border-brand-blue focus:border-brand-blue focus:ring-brand-blue/50'
      : 'border-brand-gray-border hover:border-brand-gray-hover focus:border-brand-blue focus:ring-brand-blue/50';

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-brand-gray-light mb-2">
            {label}
            {props.required && <span className="text-brand-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-gray">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              ${baseClasses}
              ${sizes[size]}
              ${borderColors}
              ${leftIcon ? 'pl-10' : ''}
              ${(rightIcon || type === 'password') ? 'pr-10' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-brand-gray-darker' : 'text-brand-gray-light'}
              ${error ? 'border-brand-error' : ''}
              ${className}
            `.trim()}
            {...props}
          />

          {type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-gray hover:text-brand-gray-light transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {/* olho simples */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                )}
              </svg>
            </button>
          )}

          {rightIcon && type !== 'password' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-brand-gray">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-brand-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-brand-gray">{helperText}</p>
        )}
      </div>
    );
  })
);

export default Input;
