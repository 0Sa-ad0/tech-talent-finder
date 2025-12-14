const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
    });
    
    const content = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      return {
        score: 75,
        summary: content,
        strengths: [],
        weaknesses: [],
        recommendations: []
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      score: 50,
      summary: "Unable to evaluate candidate at this time",
      strengths: [],
      weaknesses: [],
      recommendations: ["Please try again later"]
    };
  }
};

module.exports = { evaluateCandidate };