import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateList from './pages/CandidateList';
import CandidateDetail from './pages/CandidateDetail';
import AddCandidate from './pages/AddCandidate';
import EditCandidate from './pages/EditCandidate';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import AddJob from './pages/AddJob';
import EditJob from './pages/EditJob';
import Interview from './pages/Interview';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AuthRoutes />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

function AuthRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <>
      {user && <Navbar />}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/candidates" element={<CandidateList />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />
              <Route path="/candidates/add" element={<AddCandidate />} />
              <Route path="/candidates/:id/edit" element={<EditCandidate />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/jobs/add" element={<AddJob />} />
              <Route path="/jobs/:id/edit" element={<EditJob />} />
              <Route path="/interview/:id" element={<Interview />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>
    </>
  );
}

export default App;