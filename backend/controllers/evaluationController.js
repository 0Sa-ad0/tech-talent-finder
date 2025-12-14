const { evaluateCandidate } = require('../services/ollamaService');

// @desc    Evaluate candidate skills
// @route   POST /api/evaluations/skills
// @access  Private
const evaluateSkills = async (req, res) => {
  try {
    const { skills, experience, jobRequirements } = req.body;
    
    const evaluation = await evaluateCandidate({
      skills,
      experience,
      jobRequirements
    });
    
    // Ensure all fields are present
    const safeEvaluation = {
      score: evaluation.score || 50,
      summary: evaluation.summary || "No summary available",
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      recommendations: evaluation.recommendations || []
    };
    
    res.json(safeEvaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Generate interview questions
// @route   POST /api/evaluations/questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { skills, experience, jobTitle } = req.body;
    
    const prompt = `
      Generate 5 technical interview questions for a ${jobTitle} position.
      The candidate has ${experience} years of experience and skills in: ${skills.join(', ')}.
      
      Format the response as a JSON array of objects with the following structure:
      [
        {
          "question": "Question text",
          "category": "Category (e.g., JavaScript, Algorithms, System Design)",
          "difficulty": "Easy, Medium, or Hard"
        }
      ]
    `;
    
    const response = await evaluateCandidate({ prompt });
    
    // Try to parse the response as JSON, if it fails return a default set of questions
    try {
      if (response.questions && Array.isArray(response.questions)) {
        res.json(response.questions);
      } else {
        // If the response doesn't contain questions in the expected format, create default questions
        const defaultQuestions = [
          {
            question: `Can you explain your experience with ${skills[0] || 'your primary technology'}?`,
            category: skills[0] || 'Technical Skills',
            difficulty: 'Medium'
          },
          {
            question: 'Describe a challenging technical problem you solved recently.',
            category: 'Problem Solving',
            difficulty: 'Medium'
          },
          {
            question: 'How do you approach learning new technologies?',
            category: 'Learning Ability',
            difficulty: 'Easy'
          },
          {
            question: 'Describe your experience working in a team environment.',
            category: 'Teamwork',
            difficulty: 'Easy'
          },
          {
            question: 'Where do you see yourself professionally in 5 years?',
            category: 'Career Goals',
            difficulty: 'Easy'
          }
        ];
        res.json(defaultQuestions);
      }
    } catch (parseError) {
      // Return default questions if parsing fails
      const defaultQuestions = [
        {
          question: `Can you explain your experience with ${skills[0] || 'your primary technology'}?`,
          category: skills[0] || 'Technical Skills',
          difficulty: 'Medium'
        },
        {
          question: 'Describe a challenging technical problem you solved recently.',
          category: 'Problem Solving',
          difficulty: 'Medium'
        },
        {
          question: 'How do you approach learning new technologies?',
          category: 'Learning Ability',
          difficulty: 'Easy'
        },
        {
          question: 'Describe your experience working in a team environment.',
          category: 'Teamwork',
          difficulty: 'Easy'
        },
        {
          question: 'Where do you see yourself professionally in 5 years?',
          category: 'Career Goals',
          difficulty: 'Easy'
        }
      ];
      res.json(defaultQuestions);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  evaluateSkills,
  generateInterviewQuestions
};