const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Property = require('../models/Property');

// Set up OpenAI instance (requires process.env.OPENAI_API_KEY)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Retrieve properties from database to supply as context to the AI
        // We limit to active properties, and returning key fields to save AI tokens
        const properties = await Property.find({ status: 'active' }).select('title price location type images').limit(100);

        const simplifiedProperties = properties.map(p => ({
            id: p._id.toString(),
            title: p.title,
            price: p.price,
            location: p.location,
            type: p.type,
            image: p.images && p.images.length > 0 ? p.images[0] : ''
        }));

        // Construct System Prompt
        const systemPrompt = `You are "Winner AI", the official virtual housing assistant for the Nigerian platform Rentam. 
Your job is to happily and professionally help users find properties in our database. 
You can understand English, Nigerian Pidgin, and Igbo. 
IMPORTANT INSTRUCTIONS FOR YOUR BEHAVIOR:
1. If the user asks for properties in a specific location/university, YOU MUST cross-check against the following dataset natively.
2. If properties matching their location/budget are available in the JSON dataset below, recommend them using friendly text AND return them beautifully formatted in HTML using bootstrap cards!
   Example HTML Format for a matching property:
   <div class="bg-white p-2 rounded text-dark shadow-sm mb-2" style="font-size: 13px;">
      <img src="[INSERT IMAGE URL HERE]" class="img-fluid rounded mb-1" style="height: 80px; width: 100%; object-fit: cover;">
      <strong>[INSERT TITLE HERE]</strong><br>
      <span class="text-danger fw-bold">₦[INSERT PRICE HERE]</span><br>
      <small><a href="details.html?id=[INSERT ID HERE]" class="btn btn-sm btn-primary rounded-pill mt-1 py-0 px-2" style="font-size: 11px;">View Home</a></small>
   </div>
3. If no property matches in the dataset explicitly, apologize and state clearly that it is "not available manually, but you can leave a request or adjust your budget." Do not hallucinate properties that are not in the JSON.
4. Keep the text conversation brief since the UI chat window is small. Provide up to 3 options maximum to save space.

--- CURRENT RENTAM PROPERTY DATABASE (JSON FORMAT) ---
${JSON.stringify(simplifiedProperties)}
------------------------------------------------------
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        const aiResponseText = completion.choices[0].message.content;

        res.json({ response: aiResponseText });
    } catch (err) {
        console.error('--- OPENAI ERROR ---');
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        res.status(err.status || 500).json({ 
            error: 'AI Assistant unavailable', 
            details: err.message 
        });
    }
});

module.exports = router;
