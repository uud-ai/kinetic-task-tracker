import { vi } from 'vitest';

export const mockUser = { id: 'test-user-id', email: 'test@example.com' };

export function useAuth() {
  return {
    user: mockUser,
    initializing: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
}
