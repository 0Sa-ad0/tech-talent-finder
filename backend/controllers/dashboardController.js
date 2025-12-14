const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const newCandidates = await Candidate.countDocuments({ status: 'new' });
    const contactedCandidates = await Candidate.countDocuments({ status: 'contacted' });
    const interviewedCandidates = await Candidate.countDocuments({ status: 'interviewed' });
    const hiredCandidates = await Candidate.countDocuments({ status: 'hired' });
    
    const totalJobs = await Job.countDocuments();
    const publishedJobs = await Job.countDocuments({ status: 'published' });
    
    res.json({
      candidates: {
        total: totalCandidates,
        new: newCandidates,
        contacted: contactedCandidates,
        interviewed: interviewedCandidates,
        hired: hiredCandidates
      },
      jobs: {
        total: totalJobs,
        published: publishedJobs
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recent candidates
// @route   GET /api/dashboard/recent-candidates
// @access  Private
const getRecentCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentCandidates
};