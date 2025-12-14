const { evaluateCandidate } = require('./services/ollamaService');

const runTest = async () => {
    console.log("Starting Ollama integration test...");
    
    // Test case 1: Candidate evaluation
    console.log("\n--- Testing Candidate Evaluation ---");
    const evaluation = await evaluateCandidate({
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 5,
        jobRequirements: ['Fullstack development', 'API design']
    });
    
    console.log("Result:", JSON.stringify(evaluation, null, 2));

    if (evaluation.score && evaluation.summary) {
        console.log("✅ Candidate evaluation passed!");
    } else {
        console.error("❌ Candidate evaluation failed or returned fallback mock.");
    }
};

runTest();
