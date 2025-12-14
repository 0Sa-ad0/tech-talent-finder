import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import CandidateCard from './CandidateCard';

const Dashboard = () => {
  const socket = useSocket();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interviewed: 0,
    hired: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [candidatesRes, statsRes] = await Promise.all([
          api.get('/candidates'),
          api.get('/dashboard/stats')
        ]);
        
        setCandidates(candidatesRes.data);
        setStats(statsRes.data);
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
        setCandidates(prev => [newCandidate, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          new: prev.new + 1
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
          total: prev.total - 1
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
          new: prev.new - 1,
          contacted: prev.contacted + 1
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
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Candidates</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">New</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.new}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Contacted</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.contacted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Interviewed</h3>
          <p className="text-3xl font-bold text-purple-500">{stats.interviewed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Hired</h3>
          <p className="text-3xl font-bold text-green-500">{stats.hired}</p>
        </div>
      </div>
      
      {/* Recent Candidates */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Candidates</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Add Candidate
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.slice(0, 6).map(candidate => (
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