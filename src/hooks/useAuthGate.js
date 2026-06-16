import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

/**
 * Returns a guard function.
 * If authenticated: calls fn() immediately.
 * If not: opens auth modal with optional draft save, runs fn after login.
 *
 * Usage:
 *   const guard = useAuthGate();
 *   guard(() => submitComment(), "Sign in to comment");
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  return function guard(action, reason = "Sign in to continue") {
    if (isAuthenticated) {
      action();
    } else {
      requireAuth(action, reason);
    }
  };
}