// Hardcoded Authentication Service (No Firebase)

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Hardcoded users
const HARDCODED_USERS = [
  {
    email: 'admin@tristar.com',
    password: 'tristar123',
    uid: 'admin-001',
    displayName: 'Admin User'
  },
  {
    email: 'test@tristar.com',
    password: 'test123',
    uid: 'test-001',
    displayName: 'Test User'
  }
];

class AuthServiceClass {
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    // Check if user is stored in localStorage on init
    const storedUser = localStorage.getItem('tristar_auth_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('tristar_auth_user');
      }
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find matching user
      const user = HARDCODED_USERS.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error('auth/invalid-credential');
      }

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };

      this.currentUser = authUser;
      localStorage.setItem('tristar_auth_user', JSON.stringify(authUser));

      // Notify listeners
      this.notifyListeners(authUser);

      return authUser;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      this.currentUser = null;
      localStorage.removeItem('tristar_auth_user');

      // Notify listeners
      this.notifyListeners(null);
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error(error.message || "Failed to sign out");
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    // Add listener
    this.listeners.push(callback);

    // Immediately call with current user
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state change
  private notifyListeners(user: AuthUser | null) {
    this.listeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }
}

export const AuthService = new AuthServiceClass();
