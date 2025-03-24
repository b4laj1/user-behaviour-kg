const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const rateLimitMiddleware = require('../middleware/rateLimiter');
const { redisFetch, redisAdd } = require('../utilities/redis');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

router.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  });
});

router.post('/generate-knowledge-graph-v0', rateLimitMiddleware(), async (req, res) => {
  try {
    const { profession, location, company, age } = req.body;
    
    if (!profession || !location || !company || !age) {
      return res.status(400).json({
        error: 'Missing required fields. Please provide profession, location, company, and age.'
      });
    }
    const redisKey = `v0_key_${[profession, location, company]
      .map(str => str.trim().toLowerCase().replace(/\s+/g, '_'))
      .join('_')}_${age}`;
    const cachedData = await redisFetch(redisKey);
    if(cachedData){
      return res.json(cachedData);
    }

    const prompt = `Generate a comprehensive knowledge graph for a professional individual with the following attributes:
    - Profession: ${profession}
    - Location: ${location}
    - Company: ${company}
    - Age: ${age}

    Please provide a JSON response with the following structure:
    {
      "tools": {
        "0.9-Probability": [3-5 tools that 90% of professionals in this archetype would have used],
        "0.7-Probability": [3-5 tools that 70% of professionals in this archetype would have used],
        "0.5-Probability": [3-5 tools that 50% of professionals in this archetype would have used]
      },
      "painPoints": {
        "0.9-Probability": [2-4 pain points that 90% of professionals in this archetype would face],
        "0.7-Probability": [2-4 pain points that 70% of professionals in this archetype would face],
        "0.5-Probability": [2-4 pain points that 50% of professionals in this archetype would face]
      },
      "cognitiveAttributes": {
        "patternRecognition": "Low/Medium/High",
        "associativeMemory": "Low/Medium/High",
        "emotionalInfluence": "Low/Medium/High",
        "heuristicProcessing": "Low/Medium/High",
        "parallelProcessing": "Low/Medium/High",
        "implicitLearning": "Low/Medium/High",
        "reflexiveResponses": "Low/Medium/High",
        "cognitiveBiases": "Low/Medium/High",
        "logicalReasoning": "Low/Medium/High",
        "abstractThinking": "Low/Medium/High",
        "deliberativeDecisionMaking": "Low/Medium/High",
        "sequentialProcessing": "Low/Medium/High",
        "cognitiveControl": "Low/Medium/High",
        "goalOrientedPlanning": "Low/Medium/High",
        "metaCognition": "Low/Medium/High"
      }
    }

    Make the response realistic and specific to this professional archetype. Consider the role, industry, and typical responsibilities when determining the cognitive attributes and tools used.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7
    });

    const knowledgeGraph = JSON.parse(message.content[0].text);
    await redisAdd(redisKey, knowledgeGraph);
    res.json(knowledgeGraph);

  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    res.status(500).json({
      error: 'Failed to generate knowledge graph',
      details: error.message
    });
  }
});

router.post('/generate-knowledge-graph-v1', rateLimitMiddleware(), async (req, res) => {
  try {
    const { profession, location, company, age } = req.body;

    if (!profession || !location || !company || !age) {
      return res.status(400).json({
        error: 'Missing required fields. Please provide profession, location, company, and age.'
      });
    }
    const redisKey = `v1_key_${[profession, location, company]
      .map(str => str.trim().toLowerCase().replace(/\s+/g, '_'))
      .join('_')}_${age}`;
    const cachedData = await redisFetch(redisKey);
    if(cachedData){
      return res.json(cachedData);
    }

    const prompt = `Generate a nested json object for a professional individual with the following attributes:
    - Profession: ${profession}
    - Location: ${location}
    - Company: ${company}
    - Age: ${age}

    Please provide a JSON response with the following structure:
    {
      "tools": {
        "0.9-Probability": [3-5 tools that 90% of professionals in this archetype would have used],
        "0.7-Probability": [3-5 tools that 70% of professionals in this archetype would have used],
        "0.5-Probability": [3-5 tools that 50% of professionals in this archetype would have used]
      },
      "painPoints": {
        "0.9-Probability": [2-4 pain points that 90% of professionals in this archetype would face],
        "0.7-Probability": [2-4 pain points that 70% of professionals in this archetype would face],
        "0.5-Probability": [2-4 pain points that 50% of professionals in this archetype would face]
      },
      "cognitiveAttributes": {
        "patternRecognition": "Low/Medium/High",
        "associativeMemory": "Low/Medium/High",
        "emotionalInfluence": "Low/Medium/High",
        "heuristicProcessing": "Low/Medium/High",
        "parallelProcessing": "Low/Medium/High",
        "implicitLearning": "Low/Medium/High",
        "reflexiveResponses": "Low/Medium/High",
        "cognitiveBiases": "Low/Medium/High",
        "logicalReasoning": "Low/Medium/High",
        "abstractThinking": "Low/Medium/High",
        "deliberativeDecisionMaking": "Low/Medium/High",
        "sequentialProcessing": "Low/Medium/High",
        "cognitiveControl": "Low/Medium/High",
        "goalOrientedPlanning": "Low/Medium/High",
        "metaCognition": "Low/Medium/High"
      }
    }

    Make the response realistic and specific to this professional archetype. Consider the role, industry, and typical responsibilities when determining the cognitive attributes and tools used. Just provide the data without going into explaining it`;

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      messages: [
        {
          role: 'system',
          content: 'You are a professional knowledge graph generator. Provide accurate, realistic, and well-structured responses in JSON format. Do not include any markdown formatting or explanations, just the raw JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'sonar',
      max_tokens: 1000,
      temperature: 0.5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      }
    });

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    const knowledgeGraph = JSON.parse(jsonStr);
    
    await redisAdd(redisKey, knowledgeGraph);
    res.json(knowledgeGraph);

  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    res.status(500).json({
      error: 'Failed to generate knowledge graph',
      details: error.message
    });
  }
});

module.exports = router;
