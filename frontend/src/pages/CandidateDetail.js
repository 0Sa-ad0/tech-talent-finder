import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CandidateDetail = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await api.get(`/candidates/${id}`);
        // Ensure candidate has all required fields with defaults
        const candidateData = {
          ...response.data,
          skills: response.data.skills || [],
          evaluation: {
            score: 0,
            summary: '',
            strengths: [],
            weaknesses: [],
            recommendations: [],
            ...response.data.evaluation
          }
        };
        setCandidate(candidateData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching candidate:', error);
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const response = await api.post(`/candidates/${id}/evaluate`);
      // Ensure evaluation has all required fields with defaults
      const candidateData = {
        ...candidate,
        evaluation: {
          score: 0,
          summary: '',
          strengths: [],
          weaknesses: [],
          recommendations: [],
          ...response.data.evaluation
        }
      };
      setCandidate(candidateData);
    } catch (error) {
      console.error('Error evaluating candidate:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/candidates/${id}/contact`, emailForm);
      alert('Email sent successfully!');
      setEmailForm({ subject: '', message: '' });
      // Refresh candidate data
      const response = await api.get(`/candidates/${id}`);
      const candidateData = {
        ...response.data,
        skills: response.data.skills || [],
        evaluation: {
          score: 0,
          summary: '',
          strengths: [],
          weaknesses: [],
          recommendations: [],
          ...response.data.evaluation
        }
      };
      setCandidate(candidateData);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/candidates/${id}`);
        navigate('/candidates');
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'screened': return 'bg-purple-100 text-purple-800';
      case 'interviewed': return 'bg-indigo-100 text-indigo-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-teal-100 text-teal-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading candidate details...</div>;
  }

  if (!candidate) {
    return <div className="text-center py-10">Candidate not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{candidate.name}</h1>
          <div className="flex items-center mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
              {candidate.status}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {candidate.experience} years experience
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/candidates/${id}/edit`}
            className="btn btn-primary"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-gray-900">{candidate.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="text-gray-900">{candidate.phone || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-gray-900">{candidate.location || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Source</h3>
                <p className="text-gray-900 capitalize">{candidate.source}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills || []).map((skill, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
              {(!candidate.skills || candidate.skills.length === 0) && (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {candidate.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">{candidate.notes}</p>
            </div>
          )}
        </div>

        {/* Actions and Evaluation */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {evaluating ? 'Evaluating...' : 'Evaluate with AI'}
              </button>
              <Link
                to={`/interview/${id}`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-center"
              >
                Start Interview
              </Link>
            </div>
          </div>

          {candidate.evaluation && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Evaluation</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className="text-lg font-bold text-primary-600">{candidate.evaluation.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${candidate.evaluation.score}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Summary</h3>
                <p className="text-gray-600 text-sm">{candidate.evaluation.summary}</p>
              </div>
              
              {candidate.evaluation.strengths && candidate.evaluation.strengths.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Strengths</h3>
                  <ul className="list-disc pl-5 text-gray-600 text-sm">
                    {candidate.evaluation.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {candidate.evaluation.weaknesses && candidate.evaluation.weaknesses.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 text-gray-600 text-sm">
                    {candidate.evaluation.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {candidate.evaluation.recommendations && candidate.evaluation.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Recommendations</h3>
                  <ul className="list-disc pl-5 text-gray-600 text-sm">
                    {candidate.evaluation.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Candidate</h2>
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={emailForm.subject}
                  onChange={handleEmailChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={emailForm.message}
                  onChange={handleEmailChange}
                  required
                  className="form-input"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary"
              >
                Send Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;