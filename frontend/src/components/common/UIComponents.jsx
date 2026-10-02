import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Reusable Modern Button
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  icon: Icon,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3.5 text-base gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

/**
 * Reusable Badge Component
 */
export function Badge({ children, variant = 'neutral', icon: Icon, className = '' }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

/**
 * Reusable Input Field
 */
export function Input({
  label,
  icon: Icon,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  onClear,
  ...props
}) {
  return (
    <div className="w-full text-left">
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-3.5'} ${onClear && value ? 'pr-9' : 'pr-3.5'} focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all ${error ? 'border-rose-500' : ''} ${className}`}
          {...props}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
    </div>
  );
}

/**
 * Animated Modal
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full ${maxWidth} bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-5`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mobile Bottom Sheet Component
 */
export function BottomSheet({ children, className = '' }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 p-4 safe-bottom ${className}`}
    >
      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
      {children}
    </motion.div>
  );
}

/**
 * Rating Component
 */
export function Rating({ score, totalReviews, size = 'sm' }) {
  return (
    <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
      <Star className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400 fill-amber-400`} />
      <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{score}</span>
      {totalReviews && (
        <span className="text-slate-400 text-xs font-normal">({totalReviews})</span>
      )}
    </div>
  );
}

/**
 * Toast Notification
 */
export function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3 text-slate-800 text-sm font-medium"
    >
      {icons[type]}
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
