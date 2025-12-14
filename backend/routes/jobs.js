const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      skills,
      experience,
      salary,
      status
    } = req.body;
    
    const job = new Job({
      title,
      company,
      location,
      type,
      description,
      requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      experience: experience || 0,
      salary: salary || { min: '', max: '', currency: 'USD' },
      status: status || 'draft'
    });
    
    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      skills,
      experience,
      salary,
      status
    } = req.body;
    
    job.title = title || job.title;
    job.company = company || job.company;
    job.location = location || job.location;
    job.type = type || job.type;
    job.description = description || job.description;
    job.requirements = requirements ? requirements.split(',').map(req => req.trim()) : job.requirements;
    job.skills = skills ? skills.split(',').map(skill => skill.trim()) : job.skills;
    job.experience = experience || job.experience;
    job.salary = salary || job.salary;
    job.status = status || job.status;
    job.updatedAt = Date.now();
    
    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    await job.remove();
    res.json({ message: 'Job removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;