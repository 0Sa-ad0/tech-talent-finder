import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Interview = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await api.get(`/candidates/${id}`);
        setCandidate(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching candidate:', error);
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/evaluations/questions', {
        skills: candidate.skills,
        experience: candidate.experience,
        jobTitle: 'Software Developer'
      });
      setQuestions(response.data);
      setAnswers(new Array(response.data.length).fill(''));
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // In a real app, you would save the interview responses
      alert('Interview completed successfully!');
      navigate(`/candidates/${id}`);
    } catch (error) {
      console.error('Error submitting interview:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading candidate...</div>;
  }

  if (!candidate) {
    return <div className="text-center py-10">Candidate not found</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Technical Interview</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="mb-4">Generate technical interview questions for {candidate.name}</p>
          <button
            onClick={generateQuestions}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Interview Completed</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">Thank you for completing the interview with {candidate.name}.</p>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Submit Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Technical Interview</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Question {currentQuestion + 1} of {questions.length}</h2>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
              {questions[currentQuestion].difficulty}
            </span>
          </div>
          <p className="text-gray-700">{questions[currentQuestion].question}</p>
          <p className="text-sm text-gray-500 mt-1">Category: {questions[currentQuestion].category}</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">Candidate's Answer</label>
          <textarea
            id="answer"
            rows="6"
            value={answers[currentQuestion]}
            onChange={handleAnswerChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Record the candidate's answer here..."
          ></textarea>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {currentQuestion === questions.length - 1 ? 'Finish Interview' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interview;