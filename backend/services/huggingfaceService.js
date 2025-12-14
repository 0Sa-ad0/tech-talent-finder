const axios = require('axios');

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const MODEL_NAME = 'google/flan-t5-base'; // Using a smaller model that's more likely to be available

const evaluateCandidate = async ({ skills, experience, jobRequirements, prompt }) => {
  try {
    let systemPrompt = `You are an expert technical recruiter with deep knowledge of software engineering roles and skills. 
    Your task is to evaluate candidates based on their skills and experience.`;
    
    let userPrompt = '';
    
    if (prompt) {
      userPrompt = prompt;
    } else {
      userPrompt = `
        Evaluate a candidate with the following profile:
        - Skills: ${skills.join(', ')}
        - Years of experience: ${experience}
        
        ${jobRequirements ? `Job requirements: ${jobRequirements.join(', ')}` : ''}
        
        Provide a comprehensive evaluation including:
        1. Overall score (0-100)
        2. Summary of strengths and weaknesses
        3. Recommendations for next steps
        
        Format your response as a JSON object with the following structure:
        {
          "score": 85,
          "summary": "A brief summary of the candidate's profile",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2"],
          "recommendations": ["Recommendation 1", "Recommendation 2"]
        }
      `;
    }
    
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${MODEL_NAME}`,
      {
        inputs: `${systemPrompt}\n\n${userPrompt}`,
        parameters: {
          max_length: 500,
          temperature: 0.2,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    let content = response.data[0].generated_text;
    
    // Extract JSON from the response if it's embedded in text
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      return {
        score: 75,
        summary: content,
        strengths: extractList(content, 'strengths') || ['Technical skills'],
        weaknesses: extractList(content, 'weaknesses') || ['Areas for improvement'],
        recommendations: extractList(content, 'recommendations') || ['Continue learning']
      };
    }
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    // Fallback to mock evaluation if API fails
    return getMockEvaluation({ skills, experience });
  }
};

// Helper function to extract lists from text
const extractList = (text, keyword) => {
  const regex = new RegExp(`${keyword}:\\s*([\\s\\S]*?)(?=\\n\\n|\\n[0-9]+\\.\\s|\\n[A-Z][a-z]+:|$)`, 'i');
  const match = text.match(regex);
  if (match) {
    return match[1].split('\n').filter(item => item.trim() !== '').map(item => item.replace(/^[-*]\s*/, '').trim());
  }
  return null;
};

// Mock evaluation function as fallback
const getMockEvaluation = ({ skills, experience }) => {
  // Calculate a mock score based on skills and experience
  let score = 50; // Base score
  
  // Increase score based on experience
  if (experience >= 5) score += 20;
  else if (experience >= 3) score += 15;
  else if (experience >= 1) score += 10;
  
  // Increase score based on number of skills
  score += Math.min(skills.length * 3, 20);
  
  // Cap at 100
  score = Math.min(score, 100);
  
  // Generate mock strengths based on skills
  const strengths = [];
  if (skills.includes('React') || skills.includes('Vue') || skills.includes('Angular')) {
    strengths.push('Strong frontend development skills');
  }
  if (skills.includes('Node.js') || skills.includes('Django') || skills.includes('Spring')) {
    strengths.push('Good backend development knowledge');
  }
  if (skills.includes('Python') || skills.includes('Java') || skills.includes('JavaScript')) {
    strengths.push('Proficient in core programming languages');
  }
  if (experience >= 3) {
    strengths.push('Substantial work experience');
  }
  if (skills.length >= 5) {
    strengths.push('Diverse technical skill set');
  }
  
  // Ensure at least one strength
  if (strengths.length === 0) strengths.push('Eager to learn new technologies');
  
  // Generate mock weaknesses
  const weaknesses = [];
  if (experience < 2) {
    weaknesses.push('Limited professional experience');
  }
  if (!skills.includes('React') && !skills.includes('Vue') && !skills.includes('Angular')) {
    weaknesses.push('Lacks modern frontend framework experience');
  }
  if (!skills.includes('Node.js') && !skills.includes('Django') && !skills.includes('Spring')) {
    weaknesses.push('Limited backend development experience');
  }
  if (skills.length < 3) {
    weaknesses.push('Narrow technical skill set');
  }
  
  // Ensure at least one weakness
  if (weaknesses.length === 0) weaknesses.push('Could benefit from more specialized knowledge');
  
  // Generate mock recommendations
  const recommendations = [];
  if (experience < 2) {
    recommendations.push('Gain more experience through personal projects');
  }
  if (!skills.includes('React') && !skills.includes('Vue') && !skills.includes('Angular')) {
    recommendations.push('Learn a modern frontend framework');
  }
  if (!skills.includes('Node.js') && !skills.includes('Django') && !skills.includes('Spring')) {
    recommendations.push('Develop backend development skills');
  }
  if (skills.length < 3) {
    recommendations.push('Expand technical skill set');
  }
  recommendations.push('Consider contributing to open source projects');
  
  return {
    score,
    summary: `Candidate with ${experience} years of experience and skills in ${skills.join(', ')}. Shows potential for growth in technical roles.`,
    strengths,
    weaknesses,
    recommendations
  };
};

module.exports = { evaluateCandidate };