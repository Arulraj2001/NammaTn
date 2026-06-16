import React, { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // callback to run after login
  const [reason, setReason] = useState(""); // why login is needed

  const requireAuth = useCallback((action, reasonText = "") => {
    setPendingAction(() => action);
    setReason(reasonText);
    setIsOpen(true);
  }, []);

  const onLoginSuccess = useCallback(() => {
    setIsOpen(false);
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 300);
    }
  }, [pendingAction]);

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
    setReason("");
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, requireAuth, onLoginSuccess, close, reason }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
};