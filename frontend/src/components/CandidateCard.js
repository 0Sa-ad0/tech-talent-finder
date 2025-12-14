import React from 'react';
import { Link } from 'react-router-dom';

const CandidateCard = ({ candidate }) => {
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

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
          <p className="text-gray-600">{candidate.email}</p>
          <p className="text-gray-600">{candidate.phone}</p>
          <p className="text-gray-600">{candidate.location}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
          {candidate.status}
        </span>
      </div>
      
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700">Skills:</h4>
        <div className="flex flex-wrap gap-1 mt-1">
          {candidate.skills.map((skill, index) => (
            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {candidate.experience} years experience
        </span>
        <Link 
          to={`/candidates/${candidate._id}`} 
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CandidateCard;