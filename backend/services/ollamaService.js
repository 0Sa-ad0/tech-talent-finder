const axios = require('axios');

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'glm-4.6:cloud';

const evaluateCandidate = async ({ skills, experience, jobRequirements, prompt }) => {
  try {
    let systemPrompt = `You are an expert technical recruiter. Your task is to evaluate candidates based on their skills and experience.`;
    let userPrompt = '';
    
    if (prompt) {
      userPrompt = prompt;
    } else {
      userPrompt = `
        Evaluate a candidate with the following profile:
        - Skills: ${skills ? skills.join(', ') : 'None listed'}
        - Years of experience: ${experience || 0}
        
        ${jobRequirements ? `Job requirements: ${jobRequirements.join(', ')}` : ''}
        
        Provide a comprehensive evaluation including:
        1. Overall score (0-100)
        2. Summary of strengths and weaknesses
        3. Recommendations for next steps
        
        IMPORTANT: Return ONLY a valid JSON object with no additional text or markdown formatting. The JSON should have this structure:
        {
          "score": 85,
          "summary": "Brief summary text",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2"],
          "recommendations": ["Recommendation 1", "Recommendation 2"]
        }
      `;
    }
    
    // Construct the prompt for Ollama
    // Depending on the model, format might vary, but standard text-in is usually fine.
    // We explicitly ask for JSON mode if possible, but standard prompting works too.
    
    const finalPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log(`Sending request to Ollama with model: ${MODEL_NAME}`);
    
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt: finalPrompt,
      stream: false,
      format: "json" // Request JSON output specifically
    });
    
    let content = response.data.response;
    console.log('Ollama response received');
    
    // Parse JSON
    try {
      // Sometimes models wrap JSON in markdown blocks like ```json ... ```
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         content = jsonMatch[0];
      }
      return JSON.parse(content);
    } catch (parseError) {
      console.warn('Failed to parse JSON directly, attempting fallback structure', parseError);
      return {
        score: 70,
        summary: "Could not parse specific details from AI response. Raw response: " + content.substring(0, 100) + "...",
        strengths: ["Technical potential"],
        weaknesses: ["Parsing error caught"],
        recommendations: ["Review raw output"]
      };
    }

  } catch (error) {
    console.error('Ollama API error:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    // If request fails (e.g. Ollama not running), fall back to mock
    if (error.code === 'ECONNREFUSED') {
        console.error('Make sure Ollama is running! (ollama run glm-4.6:cloud)');
    }
    return getMockEvaluation({ skills, experience });
  }
};

// Mock evaluation function as fallback (copied from huggingfaceService for reliability)
const getMockEvaluation = ({ skills, experience }) => {
  let score = 50;
  if (experience >= 5) score += 20;
  else if (experience >= 3) score += 15;
  
  score += Math.min((skills ? skills.length : 0) * 3, 20);
  score = Math.min(score, 100);
  
  return {
    score,
    summary: `Candidate with ${experience} years of experience. (System fallback due to AI unavailability)`,
    strengths: ["Self-starter", "Resilient"],
    weaknesses: ["Could not perform deep AI analysis"],
    recommendations: ["Ensure Ollama is running locally"]
  };
};

module.exports = { evaluateCandidate };
