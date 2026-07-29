/**
 * Auth context — manages JWT token and current user state.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { ME } from '../graphql/queries';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const { data, loading } = useQuery(ME, { skip: !token });

    const login = (newToken) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        window.location.href = '/login';
    };

    const user = data?.me || null;
    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
