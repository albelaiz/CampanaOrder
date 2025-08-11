export function useAuth() {
  // Since we removed authentication, return a default user object
  const mockUser = {
    id: "demo-user",
    email: "demo@lacampana.com",
    firstName: "Demo",
    lastName: "User",
    role: "admin" // Give demo user admin privileges
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
