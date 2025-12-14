import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import CandidateCard from '../components/CandidateCard';

const Dashboard = () => {
  const socket = useSocket();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    candidates: {
      total: 0,
      new: 0,
      contacted: 0,
      interviewed: 0,
      hired: 0
    },
    jobs: {
      total: 0,
      published: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, candidatesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-candidates')
        ]);
        
        setStats(statsRes.data);
        setCandidates(candidatesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('candidate_added', (newCandidate) => {
        setCandidates(prev => [newCandidate, ...prev.slice(0, 4)]);
        setStats(prev => ({
          ...prev,
          candidates: {
            ...prev.candidates,
            total: prev.candidates.total + 1,
            new: prev.candidates.new + 1
          }
        }));
      });

      socket.on('candidate_updated', (updatedCandidate) => {
        setCandidates(prev => 
          prev.map(candidate => 
            candidate._id === updatedCandidate._id ? updatedCandidate : candidate
          )
        );
      });

      socket.on('candidate_deleted', (candidateId) => {
        setCandidates(prev => prev.filter(candidate => candidate._id !== candidateId));
        setStats(prev => ({
          ...prev,
          candidates: {
            ...prev.candidates,
            total: prev.candidates.total - 1
          }
        }));
      });

      socket.on('candidate_evaluated', (evaluatedCandidate) => {
        setCandidates(prev => 
          prev.map(candidate => 
            candidate._id === evaluatedCandidate._id ? evaluatedCandidate : candidate
          )
        );
      });

      socket.on('candidate_contacted', (contactedCandidate) => {
        setCandidates(prev => 
          prev.map(candidate => 
            candidate._id === contactedCandidate._id ? contactedCandidate : candidate
          )
        );
        setStats(prev => ({
          ...prev,
          candidates: {
            ...prev.candidates,
            new: prev.candidates.new - 1,
            contacted: prev.candidates.contacted + 1
          }
        }));
      });

      return () => {
        socket.off('candidate_added');
        socket.off('candidate_updated');
        socket.off('candidate_deleted');
        socket.off('candidate_evaluated');
        socket.off('candidate_contacted');
      };
    }
  }, [socket]);

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Recruiter Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Candidates</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.candidates.total}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">New</h3>
          <p className="text-3xl font-bold text-primary-400">{stats.candidates.new}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Contacted</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.candidates.contacted}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Interviewed</h3>
          <p className="text-3xl font-bold text-purple-500">{stats.candidates.interviewed}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Hired</h3>
          <p className="text-3xl font-bold text-green-500">{stats.candidates.hired}</p>
        </div>
      </div>
      
      {/* Recent Candidates */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Candidates</h2>
          <Link
            to="/candidates/add"
            className="btn btn-primary"
          >
            Add Candidate
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map(candidate => (
            <CandidateCard key={candidate._id} candidate={candidate} />
          ))}
        </div>
        
        {candidates.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No candidates found. Start by adding a new candidate.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;