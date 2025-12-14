const Candidate = require('../models/Candidate');
const { evaluateCandidate } = require('../services/ollamaService');
const { sendEmail } = require('../services/emailService');

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
const getCandidates = async (req, res) => {
  try {
    const { status, skills, experience } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (skills) query.skills = { $in: skills.split(',') };
    if (experience) query.experience = { $gte: parseInt(experience) };
    
    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a candidate
// @route   POST /api/candidates
// @access  Private
const createCandidate = async (req, res) => {
  try {
    const { name, email, phone, location, skills, experience, source } = req.body;
    
    const candidateExists = await Candidate.findOne({ email });
    
    if (candidateExists) {
      return res.status(400).json({ message: 'Candidate already exists' });
    }
    
    const candidate = new Candidate({
      name,
      email,
      phone,
      location,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      experience: experience || 0,
      source: source || 'application'
    });
    
    const createdCandidate = await candidate.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard_room').emit('candidate_added', createdCandidate);
    
    res.status(201).json(createdCandidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
// @access  Private
const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const { name, email, phone, location, skills, experience, status, notes } = req.body;
    
    candidate.name = name || candidate.name;
    candidate.email = email || candidate.email;
    candidate.phone = phone || candidate.phone;
    candidate.location = location || candidate.location;
    candidate.skills = skills ? skills.split(',').map(skill => skill.trim()) : candidate.skills;
    candidate.experience = experience || candidate.experience;
    candidate.status = status || candidate.status;
    candidate.notes = notes || candidate.notes;
    candidate.updatedAt = Date.now();
    
    const updatedCandidate = await candidate.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard_room').emit('candidate_updated', updatedCandidate);
    
    res.json(updatedCandidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    await candidate.remove();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard_room').emit('candidate_deleted', req.params.id);
    
    res.json({ message: 'Candidate removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload candidate resume
// @route   POST /api/candidates/:id/resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    candidate.resume = {
      filename: req.file.originalname,
      path: req.file.path,
      uploadDate: Date.now()
    };
    
    await candidate.save();
    
    res.json({ message: 'Resume uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Evaluate candidate
// @route   POST /api/candidates/:id/evaluate
// @access  Private
const evaluateCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // For demo purposes, we'll use skills and experience
    // In a real app, you would parse the resume text
    const evaluation = await evaluateCandidate({
      skills: candidate.skills || [],
      experience: candidate.experience || 0
    });
    
    // Ensure evaluation has all required fields
    const safeEvaluation = {
      score: evaluation.score || 50,
      summary: evaluation.summary || "No summary available",
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      recommendations: evaluation.recommendations || []
    };
    
    candidate.evaluation = safeEvaluation;
    await candidate.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard_room').emit('candidate_evaluated', candidate);
    
    res.json(safeEvaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Contact candidate
// @route   POST /api/candidates/:id/contact
// @access  Private
const contactCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const { subject, message } = req.body;
    
    await sendEmail({
      to: candidate.email,
      subject,
      text: message,
      html: `<p>${message}</p>`
    });
    
    candidate.status = 'contacted';
    candidate.updatedAt = Date.now();
    await candidate.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard_room').emit('candidate_contacted', candidate);
    
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  evaluateCandidateProfile,
  contactCandidate
};