import React from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '911234567890'; // Replace with actual number
const DEFAULT_MESSAGE = 'Hello MediSeller! I need help with medication inquiry.';

export const WhatsAppChatButton = ({ 
  message = DEFAULT_MESSAGE, 
  className = '',
  size = 'default' 
}) => {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-14 h-14',
    large: 'w-16 h-16',
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 ${sizeClasses[size]} bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group ${className}`}
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-chat-button"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with us
      </span>
    </button>
  );
};

export const WhatsAppContactButton = ({ 
  message, 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message || DEFAULT_MESSAGE);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const variants = {
    default: 'bg-green-500 hover:bg-green-600 text-white',
    outline: 'border-2 border-green-500 text-green-600 hover:bg-green-50',
    ghost: 'text-green-600 hover:bg-green-50',
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${variants[variant]} ${className}`}
      data-testid="whatsapp-contact-button"
    >
      <MessageCircle className="w-5 h-5" />
      {children || 'Chat on WhatsApp'}
    </button>
  );
};

export default WhatsAppChatButton;
