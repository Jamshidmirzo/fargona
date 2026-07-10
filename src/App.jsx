import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useEffect } from 'react';
import { API_URL } from './config';
import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider } from './contexts/LangContext';
import { SavedProvider } from './contexts/SavedContext';
import { MuseumsProvider } from './contexts/MuseumsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import MuseumPage from './pages/MuseumPage';
import MapPage from './pages/MapPage';
import TimelinePage from './pages/TimelinePage';
import RoutePage from './pages/RoutePage';
import SavedPage from './pages/SavedPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';

const AdminPage = React.lazy(() => import('./pages/AdminPage'));

function App() {
  useEffect(() => {
    if (!sessionStorage.getItem('fargona_visited')) {
      fetch(`${API_URL}/api/museums/visits`, { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('fargona_visited', '1');
    }
  }, []);

  return (
    <ThemeProvider>
      <LangProvider>
        <MuseumsProvider>
          <SavedProvider>
            <AuthProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/museum/:id" element={<MuseumPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/timeline" element={<TimelinePage />} />
                  <Route path="/route" element={<RoutePage />} />
                  <Route path="/saved" element={<SavedPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/:id" element={<NewsDetailPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Loading Admin Module...</div>}>
                        <AdminPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
              <Footer />
              </div>
            </AuthProvider>
          </SavedProvider>
        </MuseumsProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
