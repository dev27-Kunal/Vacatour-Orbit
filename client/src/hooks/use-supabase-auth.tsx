import { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const extractErrorMessage = (payload: unknown): string => {
  if (!payload) {return 'Registration failed';}

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : 'Registration failed';
  }

  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>;

    const errorField = data.error as unknown;
    if (typeof errorField === 'string') {
      const trimmed = errorField.trim();
      return trimmed.length > 0 ? trimmed : 'Registration failed';
    }

    if (errorField && typeof errorField === 'object') {
      const errorObj = errorField as Record<string, unknown>;
      if (typeof errorObj.message === 'string' && errorObj.message.trim().length > 0) {
        return errorObj.message;
      }

      const details = errorObj.details as unknown;
      if (Array.isArray(details)) {
        const firstDetail = details.find((item) => {
          if (!item || typeof item !== 'object') {return false;}
          const message = (item as Record<string, unknown>).message;
          return typeof message === 'string' && message.trim().length > 0;
        }) as Record<string, unknown> | undefined;

        if (firstDetail && typeof firstDetail.message === 'string') {
          return firstDetail.message;
        }
      }
    }

    if (typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }
  }

  return 'Registration failed';
};

interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  userType: 'BEDRIJF' | 'ZZP' | 'BUREAU' | 'SOLLICITANT';
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  totalRatings?: number;
  notificationEmail?: string;
  cvUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: { name: string; companyName?: string; userType: string }) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string; companyName?: string; userType: string }) => Promise<boolean>;
  signIn: (data: { email: string; password: string } | string, password?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; companyName?: string; notificationEmail?: string }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch user profile from our users table
  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        companyName: data.company_name,
        userType: data.user_type,
        isAdmin: data.is_admin,
        isVerified: data.is_verified,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Create user preferences with default language
  const createUserPreferences = async (userId: string) => {
    const { error } = await supabase
      .from('user_preferences')
      .insert([{
        user_id: userId,
        language: 'nl', // Default to Dutch
        timezone: 'Europe/Amsterdam',
        date_format: 'DD-MM-YYYY'
      }]);

    if (error) {
      console.error('Error creating user preferences:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // First check localStorage for custom auth
    const storedToken = localStorage.getItem('auth_token');
    const storedUserData = localStorage.getItem('user_data');
    
    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.email,
          companyName: userData.companyName,
          userType: userData.userType || 'BEDRIJF',
          isAdmin: userData.isAdmin || false,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Set a mock session for compatibility
        setSession({
          access_token: storedToken,
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + (24 * 60 * 60 * 1000),
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: userData.id,
            email: userData.email,
            app_metadata: {},
            user_metadata: { name: userData.name },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          }
        } as any);
        
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    // Fall back to Supabase session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(setUser);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        setSession(session);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setUser(userProfile);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    userData: { name: string; companyName?: string; userType: string }
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First, create the Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: import.meta.env.VITE_APP_URL || 
                          (import.meta.env.MODE === 'production' 
                            ? 'https://vacature-orbit.vercel.app' 
                            : window.location.origin)
        }
      });

      if (authError) {throw authError;}

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Then create the user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email!,
          password: '', // We don't store passwords in our table anymore
          name: userData.name,
          company_name: userData.companyName || null,
          user_type: userData.userType,
          is_admin: false,
          is_verified: false,
        }]);

      if (profileError) {throw profileError;}

      // Create user preferences
      await createUserPreferences(authData.user.id);

      toast({
        title: t('auth.registrationSuccess'),
        description: t('auth.checkEmailToConfirm'),
      });

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t('auth.registrationFailed'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; companyName?: string; userType: string }): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Use backend API route for registration to bypass RLS
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: unknown = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.warn('Failed to parse registration response JSON', parseError);
        }
      } else {
        try {
          data = await response.text();
        } catch (readError) {
          console.warn('Failed to read registration response text', readError);
        }
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(data));
      }

      toast({
        title: t('auth.registrationSuccess'),
        description: t('auth.checkEmailToConfirm'),
      });

      // After successful registration, the user needs to verify email
      // We don't automatically log them in
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t('auth.registrationFailed'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (emailOrData: { email: string; password: string } | string, passwordParam?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Handle both calling patterns
      let email: string;
      let password: string;
      
      if (typeof emailOrData === 'object') {
        email = emailOrData.email;
        password = emailOrData.password;
      } else {
        email = emailOrData;
        password = passwordParam!;
      }
      
      // Call our custom login API instead of Supabase directly
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Parse the actual error message to avoid "[object Object]"
        const errorMessage = errorData.error?.message || errorData.error || 'Login failed';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      // Handle API response format: { success: true, data: { user, token } }
      const data = responseData.data || responseData;

      // Store session data and update state
      if (data.token && data.user) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        // Update the user state to trigger re-renders
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || data.user.email,
          companyName: data.user.companyName,
          userType: data.user.userType || 'BEDRIJF',
          isAdmin: data.user.isAdmin || false,
          isVerified: data.user.isVerified || true,
          createdAt: data.user.createdAt || new Date().toISOString(),
          updatedAt: data.user.updatedAt || new Date().toISOString(),
        });

        // Session is managed by backend; no need for mock Supabase session
        // Frontend uses auth_token for API authentication
      }

      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.loginSuccess'),
      });

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: t('auth.loginFailed'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Clear state
      setUser(null);
      setSession(null);
      
      // Try to sign out from Supabase as well
      const { error } = await supabase.auth.signOut();
      if (error) {console.error('Supabase signout error:', error);}

      toast({
        title: t('auth.signedOut'),
        description: t('auth.signOutSuccess'),
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: { name: string; companyName?: string; notificationEmail?: string }): Promise<boolean> => {
    if (!user) {return false;}

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          company_name: updates.companyName || null,
          notification_email: updates.notificationEmail || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {throw error;}

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        name: updates.name,
        companyName: updates.companyName,
        notificationEmail: updates.notificationEmail,
        updatedAt: new Date().toISOString(),
      } : null);

      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.profileUpdated'),
      });

      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message);
      toast({
        title: t('profile.updateFailed'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Alias for logout
  const logout = signOut;

  // register function is defined above

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {throw error;}

      toast({
        title: t('auth.passwordChanged'),
        description: t('auth.passwordChangeSuccess'),
      });

      return true;
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: t('auth.passwordChangeFailed'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password reset failed');
      }

      toast({
        title: t('auth.forgotPasswordSent'),
        description: t('auth.forgotPasswordDescription'),
      });

      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: t('auth.forgotPasswordFailed'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        signUp,
        register,
        signIn,
        signOut,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export the original hook name for compatibility
export { useAuth as useSupabaseAuth };
