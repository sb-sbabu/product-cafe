import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

/**
 * Authentication Context
 * 
 * This provides a mock auth implementation designed for easy swap to:
 * - Azure AD (MSAL.js)
 * - Microsoft Entra ID
 * - Any OAuth2/OIDC provider
 * 
 * Current implementation uses localStorage for demo purposes.
 */

export interface User {
    id: string;
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    title?: string;
    department?: string;
    avatarUrl?: string;
    roles: string[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const MOCK_USER: User = {
    id: 'u1',
    email: 'natasha.romanoff@company.com',
    displayName: 'Natasha Romanoff',
    firstName: 'Natasha',
    lastName: 'Romanoff',
    title: 'Senior Product Manager',
    department: 'Product',
    avatarUrl: '',
    roles: ['user', 'pm', 'contributor'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Login function - defined before useEffect that uses it
    const login = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // In production: Redirect to Azure AD login
            // await msalInstance.loginRedirect(loginRequest);

            // Mock login delay
            await new Promise(resolve => setTimeout(resolve, 500));

            localStorage.setItem('auth-user', JSON.stringify(MOCK_USER));
            setState({
                user: MOCK_USER,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
        }
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUser = localStorage.getItem('auth-user');
                if (storedUser) {
                    setState({
                        user: JSON.parse(storedUser),
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    // Auto-login for demo
                    await login();
                }
            } catch {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };
        checkAuth();
    }, [login]);

    const logout = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // In production: msalInstance.logoutRedirect();
            await new Promise(resolve => setTimeout(resolve, 300));

            localStorage.removeItem('auth-user');
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Logout failed',
            }));
        }
    }, []);

    const refreshToken = useCallback(async () => {
        // In production: await msalInstance.acquireTokenSilent(tokenRequest);
        console.log('[Auth] Token refresh (mock)');
    }, []);

    const hasRole = useCallback((role: string) => {
        return state.user?.roles.includes(role) ?? false;
    }, [state.user]);

    const hasAnyRole = useCallback((roles: string[]) => {
        return roles.some(role => state.user?.roles.includes(role));
    }, [state.user]);

    return (
        <AuthContext.Provider value={{
            ...state,
            login,
            logout,
            refreshToken,
            hasRole,
            hasAnyRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ========================================
// AZURE AD INTEGRATION NOTES
// ========================================

/**
 * To integrate with Azure AD:
 * 
 * 1. Install MSAL: npm install @azure/msal-browser @azure/msal-react
 * 
 * 2. Configure MSAL:
 * ```typescript
 * import { PublicClientApplication } from '@azure/msal-browser';
 * 
 * const msalConfig = {
 *   auth: {
 *     clientId: 'YOUR_CLIENT_ID',
 *     authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
 *     redirectUri: window.location.origin,
 *   },
 *   cache: {
 *     cacheLocation: 'localStorage',
 *   },
 * };
 * 
 * export const msalInstance = new PublicClientApplication(msalConfig);
 * ```
 * 
 * 3. Wrap app with MsalProvider:
 * ```tsx
 * import { MsalProvider } from '@azure/msal-react';
 * 
 * <MsalProvider instance={msalInstance}>
 *   <App />
 * </MsalProvider>
 * ```
 * 
 * 4. Use MSAL hooks:
 * ```tsx
 * import { useMsal } from '@azure/msal-react';
 * 
 * const { instance, accounts } = useMsal();
 * const account = accounts[0];
 * ```
 */
