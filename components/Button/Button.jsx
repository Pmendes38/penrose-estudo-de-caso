import { memo, forwardRef } from 'react';
import { ButtonLoader } from '../Loading/Loading';

const Button = memo(forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue-light hover:to-brand-blue text-white shadow-medium hover:shadow-glow focus:ring-brand-blue hover:scale-105',
    secondary: 'bg-brand-gray-dark hover:bg-brand-gray-hover text-brand-gray-light border border-brand-gray-border hover:border-brand-blue focus:ring-brand-blue hover:scale-105',
    outline: 'bg-transparent hover:bg-brand-blue text-brand-blue hover:text-white border-2 border-brand-blue focus:ring-brand-blue hover:scale-105',
    ghost: 'bg-transparent hover:bg-brand-gray-dark/50 text-brand-gray hover:text-white focus:ring-brand-blue',
    danger: 'bg-gradient-to-r from-brand-error to-red-600 hover:from-red-500 hover:to-red-700 text-white shadow-medium focus:ring-brand-error hover:scale-105',
    success: 'bg-gradient-to-r from-brand-success to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-medium focus:ring-brand-success hover:scale-105',
    warning: 'bg-gradient-to-r from-brand-warning to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-medium focus:ring-brand-warning hover:scale-105'
  };
  
  const sizes = {
    xs: 'px-3 py-2 text-xs gap-1.5',
    sm: 'px-4 py-2.5 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
    xl: 'px-10 py-5 text-xl gap-3'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'transform-none hover:scale-100' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <>
          <ButtonLoader size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}));

Button.displayName = 'Button';

export default Button;