const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const rateLimitMiddleware = require('../middleware/rateLimiter');
const { redisFetch, redisAdd } = require('../utilities/redis');
const {chromium} = require('playwright-extra')
const cheerio = require('cheerio')
const stealth = require('puppeteer-extra-plugin-stealth')();


// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

router.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  });
});

// router.get("/scrape", async (req, res) => {
//   const { profession, location } = req.body;

//   if (!profession || !location) {
//     return res.status(400).json({ error: "Missing profession or location parameter" });
//   }

//   const searchQuery = `${profession} ${location} LinkedIn`;
//   const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

//   try {
//     const browser = await chromium.launch({ headless: false });

//   const context = await browser.newContext({
//     proxy: {
//       server: `http://scraperapi:${process.env.SCRAPER_API_KEY}@proxy-server.scraperapi.com:8001`
//     },
//     ignoreHTTPSErrors: true,
//     userAgent: [
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
//       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
//       "Mozilla/5.0 (Linux; Android 10)"
//     ][Math.floor(Math.random() * 3)]
//   });

//   const page = await context.newPage();
//   await page.goto(searchUrl, { timeout: 60000 });
//   await page.waitForTimeout(2000);

//     const profileUrls = await page.$$eval("a", (links) =>
//       links
//         .map((link) => link.href)
//         .filter((href) => href.includes("linkedin.com/in/"))
//         .slice(0, 5)
//     );

//     const tools = new Set();

//     for (const url of profileUrls) {
//       await page.goto(url, { waitUntil: "load" });
//       await page.waitForTimeout(1500);

//       const skills = await page.$$eval(".pvs-list__item", (elements) =>
//         elements.map((el) => el.textContent.trim()).filter((text) => text.length < 40)
//       );

//       skills.forEach((skill) => tools.add(skill));
//       if (tools.size >= 10) break;
//     }

//     await browser.close();

//     res.json({ tools: Array.from(tools).slice(0, 10) });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Scraping failed" });
//   }
// });

// router.post('/reddit-scrape', async(req,res)=>{
//   const {profession, location, linksDepth=3} = req.body;
//   const searchQuery = `${profession} challenges reddit`
//   //serpapi with encoded professiona dn location

//   const API_KEY = process.env.SERPAPI_KEY;
//       const response = await axios.get("https://serpapi.com/search.json", {
//         params: {
//           api_key: API_KEY,
//           engine: "google",
//           q: searchQuery, 
//           location: "San Francisco Bay Area, California, United States",
//           google_domain: "google.com",
//           gl: "us",
//           hl: "en",
//         }
//       });
//       // let response = 
//       const redditUrls = response.data.organic_results.slice(0,linksDepth).map(x=>x.link)

//   // const redditUrls = ['https://www.reddit.com/r/AskProgramming/comments/1as54cp/what_are_the_most_common_problems_faced_by/','https://www.reddit.com/r/cscareerquestions/comments/xj3hri/what_challenges_do_a_programmer_face_in_his_career/','https://www.reddit.com/r/developersIndia/comments/188zxl6/developers_what_are_the_challenges_you_face_when/']
//       let allContent = '';

//     for (const url of redditUrls) {
//         console.log(`Scraping: ${url}`);
//         const post = await scrapeRedditPost(url);

//         if (post) {
//             const content = `
//                 URL: ${post.url}
//                 Title: ${post.title}
//                 Post: ${post.postContent}
//                 Comments: ${post.comments}
//             `;

//             allContent += content + '\n\n';
//         }
//     }
// //     allContent = `URL: https://www.reddit.com/r/AskProgramming/comments/1as54cp/what_are_the_most_common_problems_faced_by/
// //                 Title: What are the most common problems faced by programmers?
// //                 Post: undefined
// //                 Comments: Managers who don't understand what they want, what they need, and what is not possible.
// // And are blithering idiots that are slaves to the schedule but cant understand what "clear requirements" means.
// // And who change their minds at least once a day.
// // I always told my managers that anything was possible with enough time and money.  How much of each does he have?
// // By programmers do you mean hobbyists/students or do you mean professionals on the job?
// // Mostly, these are non-technical.  It's not the language, or the hardware, but the people wanting the code.  People want things that work the way they imagine, and faster than can be built.  As an analogy, they want you to build a skyscraper, in a week, for $50, but it's absolutely safe and will last 100 years.
// // People
// // Focusing on the actual problem
// // For professional programmers:
// // There are two:
            


// //                 URL: https://www.reddit.com/r/cscareerquestions/comments/xj3hri/what_challenges_do_a_programmer_face_in_his_career/
// //                 Title: What challenges do a programmer face in his career?
// //                 Post: undefined
// //                 Comments: You will be in situations where the estimated time to finish something was grossly underestimated. Or perhaps the requirements/how some code is supposed to work is underdeveloped. Whose fault was it?
// // Get out ! You can do it!
// // Back hurt.
// // It really depends on what you aim to get out of your career.
// // Honestly, for most it's the infamous "imposter syndrome". That feeling that you are a fraud and should have never got that job. For most, you can just power through and then you'll realize that it's not true.
// // Errors not being caught in the test environment and getting on production. It hurts, especially on systems that have to do with financial data 😬
// // Burnout.
// // You will often be called upon by your parents and extended family to fix printers and network problems and phone problems.
            


// //                 URL: https://www.reddit.com/r/developersIndia/comments/188zxl6/developers_what_are_the_challenges_you_face_when/
// //                 Title: Developers: What are the challenges you face when you are working on your tasks?
// //                 Post: undefined
// //                 Comments: Namaste! Thanks for submitting to r/developersIndia. Make sure to follow the subreddit Code of Conduct while participating in this thread.
// // So I am new to programming from QA background the following things are hard for me
// // Practice till you get it into muscle memory :), take a topic and work different variations/approaches. 1.2 Understand the project architecture and then debugging will become easier
// // How did you got into dev?
// // Not able to understand the requirements and where to implement is very common in juniors as it's really complicated to understand the large codebases when you're new joiner. I faced it too but thankfully I had a great senior to help me out everytime. Also merge conflicts.. I hate it so much that i prefer to work alone on any project lol
// // It's quite clear that no one ran a knowledge transfer with new guys. What d9 you expect from them.
// // This is the first thing we do whenever a new dev joins the team and we keep proper documentation about day to day work like all access issues, how to create MRs, how to review and get code reviewed...
// // Not understanding what agile is. And why am I kept criticized by agile shamans
// // It seems like one should code a lot in college days and if they can't get an internship, try to read and understand open source codebases as they can prepare them for the future 🤔?`

//     if (allContent.trim()) {
//         console.log('\nSending data to Claude API...');
//         const painPoints = await callClaudeAPI(allContent);
//         console.log('\n🔎 **Top 5 Pain Points:**');
//         console.log(painPoints);
//         return res.json(painPoints)
//     } else {

//         console.log('No valid content to send.');
//     }

// })

const generatePainPoints = async (profession) => {
  // const {profession, location, linksDepth=3} = req.body;
  const linksDepth = 3;
  const searchQuery = `${profession} challenges reddit`
  //serpapi with encoded professiona dn location

  const API_KEY = process.env.SERPAPI_KEY;
      const response = await axios.get("https://serpapi.com/search.json", {
        params: {
          api_key: API_KEY,
          engine: "google",
          q: searchQuery, 
          location: "San Francisco Bay Area, California, United States",
          google_domain: "google.com",
          gl: "us",
          hl: "en",
        }
      });
      // let response = 
      const redditUrls = response.data.organic_results.slice(0,linksDepth).map(x=>x.link)

  // const redditUrls = ['https://www.reddit.com/r/AskProgramming/comments/1as54cp/what_are_the_most_common_problems_faced_by/','https://www.reddit.com/r/cscareerquestions/comments/xj3hri/what_challenges_do_a_programmer_face_in_his_career/','https://www.reddit.com/r/developersIndia/comments/188zxl6/developers_what_are_the_challenges_you_face_when/']
      let allContent = '';

    for (const url of redditUrls) {
        console.log(`Scraping: ${url}`);
        const post = await scrapeRedditPost(url);

        if (post) {
            const content = `
                URL: ${post.url}
                Title: ${post.title}
                Post: ${post.postContent}
                Comments: ${post.comments}
            `;

            allContent += content + '\n\n';
        }
    }
//     allContent = `URL: https://www.reddit.com/r/AskProgramming/comments/1as54cp/what_are_the_most_common_problems_faced_by/
//                 Title: What are the most common problems faced by programmers?
//                 Post: undefined
//                 Comments: Managers who don't understand what they want, what they need, and what is not possible.
// And are blithering idiots that are slaves to the schedule but cant understand what "clear requirements" means.
// And who change their minds at least once a day.
// I always told my managers that anything was possible with enough time and money.  How much of each does he have?
// By programmers do you mean hobbyists/students or do you mean professionals on the job?
// Mostly, these are non-technical.  It's not the language, or the hardware, but the people wanting the code.  People want things that work the way they imagine, and faster than can be built.  As an analogy, they want you to build a skyscraper, in a week, for $50, but it's absolutely safe and will last 100 years.
// People
// Focusing on the actual problem
// For professional programmers:
// There are two:
            


//                 URL: https://www.reddit.com/r/cscareerquestions/comments/xj3hri/what_challenges_do_a_programmer_face_in_his_career/
//                 Title: What challenges do a programmer face in his career?
//                 Post: undefined
//                 Comments: You will be in situations where the estimated time to finish something was grossly underestimated. Or perhaps the requirements/how some code is supposed to work is underdeveloped. Whose fault was it?
// Get out ! You can do it!
// Back hurt.
// It really depends on what you aim to get out of your career.
// Honestly, for most it's the infamous "imposter syndrome". That feeling that you are a fraud and should have never got that job. For most, you can just power through and then you'll realize that it's not true.
// Errors not being caught in the test environment and getting on production. It hurts, especially on systems that have to do with financial data 😬
// Burnout.
// You will often be called upon by your parents and extended family to fix printers and network problems and phone problems.
            


//                 URL: https://www.reddit.com/r/developersIndia/comments/188zxl6/developers_what_are_the_challenges_you_face_when/
//                 Title: Developers: What are the challenges you face when you are working on your tasks?
//                 Post: undefined
//                 Comments: Namaste! Thanks for submitting to r/developersIndia. Make sure to follow the subreddit Code of Conduct while participating in this thread.
// So I am new to programming from QA background the following things are hard for me
// Practice till you get it into muscle memory :), take a topic and work different variations/approaches. 1.2 Understand the project architecture and then debugging will become easier
// How did you got into dev?
// Not able to understand the requirements and where to implement is very common in juniors as it's really complicated to understand the large codebases when you're new joiner. I faced it too but thankfully I had a great senior to help me out everytime. Also merge conflicts.. I hate it so much that i prefer to work alone on any project lol
// It's quite clear that no one ran a knowledge transfer with new guys. What d9 you expect from them.
// This is the first thing we do whenever a new dev joins the team and we keep proper documentation about day to day work like all access issues, how to create MRs, how to review and get code reviewed...
// Not understanding what agile is. And why am I kept criticized by agile shamans
// It seems like one should code a lot in college days and if they can't get an internship, try to read and understand open source codebases as they can prepare them for the future 🤔?`

    if (allContent.trim()) {
        // console.log('\nSending data to Claude API...');
        const painPoints = await callClaudeAPI(allContent);
        // console.log('\n🔎 **Top 5 Pain Points:**');
        // console.log(painPoints);
        // return res.json(painPoints)
        return painPoints;
    } else {

        console.log('No valid content to send.');
    }
}

const scrapeRedditPost = async (url) => {
  try {
    chromium.use(stealth);


    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      // Configure browser to appear human-like
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
      });
      
      // Load target page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000
      });
  
      // Wait for critical elements
      // await page.waitForSelector('div[data-test-id="post-content"]', { timeout: 15000 });
      await page.waitForSelector('shreddit-comment', { state: 'attached' });
  
      // Get rendered HTML
      const html = await page.content();
      const $ = cheerio.load(html);
  
      // Extract data
      const title = $('h1').first().text().trim();
      // const postContent = $('div[data-test-id="post-content"]').text().trim();
      const comments = [];
      
      $('shreddit-comment').each((_, el) => {
        const commentText = $(el).find('div[id$="-post-rtjson-content"] p').first().text().trim();
        if (commentText) comments.push(commentText);
      });
      
  
      return {
        url,
        title,
        // postContent,
        comments: comments.join('\n')
      };
  
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (error) {
      console.error(`Failed to scrape ${url}:`, error.message);
      return null;
  }
};

const callClaudeAPI = async (content) => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze the following Reddit posts - $${content} and extract the pain points and rank them`
      }],
      temperature: 0.7
    });

    return message.content[0].text;

      // return response.data.content;
  } catch (error) {
      console.error('Failed to call Claude API', error.message);
      return '';
  }
};

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
        "Near-Certain": [3 tools that 90% of professionals in this archetype would have used],
        "Highly Probable": [3 tools that 70% of professionals in this archetype would have used],
        "Moderately Probable": [3 tools that 50% of professionals in this archetype would have used]
      },
      "painPoints": {
        "Near-Certain": [2 pain points that 90% of professionals in this archetype would face],
        "Highly Probable": [2 pain points that 70% of professionals in this archetype would face],
        "Moderately Probable": [2 pain points that 50% of professionals in this archetype would face]
      },
      "cognitiveAttributes": {
        "Pattern Recognition": "Low/Medium/High",
        "Associative Memory": "Low/Medium/High",
        "Emotional Influence": "Low/Medium/High",
        "Heuristic Processing": "Low/Medium/High",
        "Parallel Processing": "Low/Medium/High",
        "Implicit Learning": "Low/Medium/High",
        "Reflexive Responses": "Low/Medium/High",
        "Cognitive Biases": "Low/Medium/High",
        "Logical Reasoning": "Low/Medium/High",
        "Abstract Thinking": "Low/Medium/High",
        "Deliberative Decision Making": "Low/Medium/High",
        "Sequential Processing": "Low/Medium/High",
        "Cognitive Control": "Low/Medium/High",
        "Goal Oriented Planning": "Low/Medium/High",
        "Meta Cognition": "Low/Medium/High"
      }
    }

    Make the response realistic and specific to this professional archetype. Consider the role, industry, and typical responsibilities when determining the cognitive attributes and tools used.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.5
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

    const prompt = `with the following attributes:
    - Profession: ${profession}
    - Location: ${location}
    - Company: ${company}
    - Age: ${age}

    Please provide a JSON response with the following structure:
    {
      "tools": {
        "Near-Certain": [3 tools that 90% of professionals in this archetype would have used],
        "Highly Probable": [3 tools that 70% of professionals in this archetype would have used],
        "Moderately Probable": [3 tools that 50% of professionals in this archetype would have used]
      },
      "painPoints": {
        "Near-Certain": [2 pain points that 90% of professionals in this archetype would face],
        "Highly Probable": [2 pain points that 70% of professionals in this archetype would face],
        "Moderately Probable": [2 pain points that 50% of professionals in this archetype would face]
      },
      "cognitiveAttributes": {
        "Pattern Recognition": "Low/Medium/High",
        "Associative Memory": "Low/Medium/High",
        "Emotional Influence": "Low/Medium/High",
        "Heuristic Processing": "Low/Medium/High",
        "Parallel Processing": "Low/Medium/High",
        "Implicit Learning": "Low/Medium/High",
        "Reflexive Responses": "Low/Medium/High",
        "Cognitive Biases": "Low/Medium/High",
        "Logical Reasoning": "Low/Medium/High",
        "Abstract Thinking": "Low/Medium/High",
        "Deliberative Decision Making": "Low/Medium/High",
        "Sequential Processing": "Low/Medium/High",
        "Cognitive Control": "Low/Medium/High",
        "Goal Oriented Planning": "Low/Medium/High",
        "Meta Cognition": "Low/Medium/High"
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

router.post('/generate-knowledge-graph-v2', rateLimitMiddleware(), async (req, res) => {
  try {
    const { profession, location, company, age } = req.body;

    if (!profession || !location || !company || !age) {
      return res.status(400).json({
        error: 'Missing required fields. Please provide profession, location, company, and age.'
      });
    }
    const redisKey = `v2_key_${[profession, location, company]
      .map(str => str.trim().toLowerCase().replace(/\s+/g, '_'))
      .join('_')}_${age}`;
    const cachedData = await redisFetch(redisKey);
    if(cachedData){
      return res.json(cachedData);
    }
    const redditPainPoints = await generatePainPoints(profession);

    const prompt = `Generate a nested json object for a professional individual with the following attributes:
    - Profession: ${profession}
    - Location: ${location}
    - Company: ${company}
    - Age: ${age}
      For pain points, use this data -redditPainPoints- ${redditPainPoints}. this is a ranked pain points data for this profession. for adding pain points data use from here only
    Please provide a JSON response with the following structure:
    {
      "tools": {
        "Near-Certain": [3 tools that 90% of professionals in this archetype would have used],
        "Highly Probable": [3 tools that 70% of professionals in this archetype would have used],
        "Moderately Probable": [3 tools that 50% of professionals in this archetype would have used]
      },
      "painPoints": {
        "Near-Certain": [analyse the data redditPainPoints i pasted here and give 2 pain points that 90% of professionals in this archetype would face],
        "Highly Probable": [analyse the data redditPainPoints i pasted here and give  2 pain points that 70% of professionals in this archetype would face],
        "Moderately Probable": [analyse the data redditPainPoints i pasted here and give 2 pain points that 50% of professionals in this archetype would face]
      },
      "cognitiveAttributes": {
        "Pattern Recognition": "Low/Medium/High",
        "Associative Memory": "Low/Medium/High",
        "Emotional Influence": "Low/Medium/High",
        "Heuristic Processing": "Low/Medium/High",
        "Parallel Processing": "Low/Medium/High",
        "Implicit Learning": "Low/Medium/High",
        "Reflexive Responses": "Low/Medium/High",
        "Cognitive Biases": "Low/Medium/High",
        "Logical Reasoning": "Low/Medium/High",
        "Abstract Thinking": "Low/Medium/High",
        "Deliberative Decision Making": "Low/Medium/High",
        "Sequential Processing": "Low/Medium/High",
        "Cognitive Control": "Low/Medium/High",
        "Goal Oriented Planning": "Low/Medium/High",
        "Meta Cognition": "Low/Medium/High"
      }
    }

    Make the response realistic and specific to this professional archetype. Consider the role, industry, and typical responsibilities when determining the cognitive attributes and tools used. Just provide the data without going into explaining it`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.1
    });

    const knowledgeGraph = JSON.parse(message.content[0].text);
    await redisAdd(redisKey, knowledgeGraph);
    res.json(knowledgeGraph);

  } catch (error) {
    console.error('Error generating comprehensive knowledge graph:', error);
    res.status(500).json({
      error: 'Failed to generate comprehensive knowledge graph',
      details: error.message
    });
  }
});

module.exports = router;
