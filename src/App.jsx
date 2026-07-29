import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import client from './apollo/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';

// Layout & Pages
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import JournalPage from './pages/JournalPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import ExpensesPage from './pages/ExpensesPage';
import TaxPage from './pages/TaxPage';
import TrialBalancePage from './pages/TrialBalancePage';
import ProfitLossPage from './pages/ProfitLossPage';
import BalanceSheetPage from './pages/BalanceSheetPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CompanyProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes inside AppLayout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="journal" element={<JournalPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="purchases" element={<PurchasesPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="tax" element={<TaxPage />} />
                <Route path="reports/trial-balance" element={<TrialBalancePage />} />
                <Route path="reports/profit-loss" element={<ProfitLossPage />} />
                <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
