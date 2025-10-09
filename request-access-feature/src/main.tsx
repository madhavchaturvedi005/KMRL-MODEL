import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import RequestAccess from '@/pages/RequestAccess';
import Signup from '@/pages/Signup';
import '@/styles/globals.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/request-access" replace />} />
        <Route path="*" element={<Navigate to="/request-access" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);