import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Departments } from './pages/Departments';
import { Designations } from './pages/Designations';
import { Employees } from './pages/Employees';
import { EmployeeForm } from './pages/EmployeeForm';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { Attendance } from './pages/Attendance';
import { Leave } from './pages/Leave';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Announcements } from './pages/Announcements';
import { Assets } from './pages/Assets';
import { Shifts } from './pages/Shifts';
import { Holidays } from './pages/Holidays';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Payroll } from './pages/Payroll';
import { Payslip } from './pages/Payslip';
import { Performance } from './pages/Performance';
import { Recruitment } from './pages/Recruitment';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';

function App() {
  useEffect(() => {
    const handleFocusOut = (e) => {
      if (e.target && e.target.type === 'date') {
        const value = e.target.value;
        if (value && value.startsWith('00')) {
          const yearPart = parseInt(value.substring(0, 4), 10);
          if (yearPart >= 0 && yearPart <= 99) {
            const newYear = 2000 + yearPart;
            const newValue = `${newYear}${value.substring(4)}`;
            
            // Set native value bypassing React's setter to trigger an update correctly
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set;
            
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(e.target, newValue);
              e.target.dispatchEvent(new Event('input', { bubbles: true }));
              e.target.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      }
    };

    document.addEventListener('focusout', handleFocusOut);
    return () => document.removeEventListener('focusout', handleFocusOut);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<EmployeeForm />} />
            <Route path="/employees/edit/:id" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeProfile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/holidays" element={<Holidays />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payslip/:id" element={<Payslip />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
          
          {/* Default redirect to dashboard, which redirects to login if unauth */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
