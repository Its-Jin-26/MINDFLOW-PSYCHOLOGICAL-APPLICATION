import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './components/AppLayout';
import RequireAuth from './components/RequireAuth';
import DashboardHome from './pages/dashboard/DashboardHome';
import SettingsPage from './pages/settings/SettingsPage';
import EmotionalSpace from './pages/dashboard/EmotionalSpace';
import HabitsPage from './pages/dashboard/HabitsPage';
import GoalsPage from './pages/dashboard/GoalsPage';
import ProgressPage from './pages/dashboard/ProgressPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app/login" element={<LoginPage />} />
        <Route path="/app/register" element={<RegisterPage />} />
        <Route
          path="/app/dashboard"
          element={(
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          )}
        >
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="emotional" element={<EmotionalSpace />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/app/login" replace />} />
        <Route path="*" element={<Navigate to="/app/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
