import { useQuery } from "@tanstack/react-query";

// disable authentication
// export function useAuth() {
//   const { data: user, isLoading } = useQuery({
//     queryKey: ["/api/auth/user"],
//     retry: false,
//   });
//
//   return {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//   };
// }

export function useAuth() {
  // Return a mock user for development without authentication
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    theme: 'light',
    language: 'en'
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true, // Always authenticated in development mode
  };
}
