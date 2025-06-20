'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const requireAuth = (callback?: () => void) => {
    if (isAuthenticated) {
      callback?.();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    options.onSuccess?.();
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return {
    showAuthModal,
    requireAuth,
    handleAuthSuccess,
    closeAuthModal,
    isAuthenticated,
    authModalProps: {
      isOpen: showAuthModal,
      onClose: closeAuthModal,
      onSuccess: handleAuthSuccess,
      title: options.title,
      subtitle: options.subtitle,
    }
  };
}