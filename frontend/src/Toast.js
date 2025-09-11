import React, { useState, useEffect } from 'react';

function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: 1000,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: '#10b981' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#ef4444' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#f59e0b' };
      default:
        return { ...baseStyle, backgroundColor: '#3b82f6' };
    }
  };

  return (
    <div style={getToastStyle()}>
      {message}
    </div>
  );
}

export default Toast;
