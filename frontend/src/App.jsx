import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';

const App = () => (
  <BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color:      '#0f172a',
          border:     '1px solid #e2e8f0',
          borderRadius: '12px',
          fontSize:   '14px',
          boxShadow:  '0 4px 20px rgba(59,130,246,0.10)',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
        error:   { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
      }}
    />
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
