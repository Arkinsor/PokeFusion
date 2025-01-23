import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// API keys and URLs
const cohereAPIKey = YourAPIKEY;
const cohereModelURL = 'https://api.cohere.com/v1/generate';
const hfAPIKey = YourAPIKEY;
const imageModelURL = 'https://api-inference.huggingface.co/models/sWizad/pokemon-trainer-sprite-pixelart';

// Endpoint for text generation
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'No prompt provided' });
    }

    try {
        const response = await fetch(cohereModelURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cohereAPIKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "command",
                prompt: prompt,
                max_tokens: 200,
                temperature: 0.9,
                k: 0,
                stop_sequences: [],
                return_likelihoods: "NONE",
            }),
        });

        const data = await response.json();
        console.log('Cohere API Response:', data);  // Log the response for debugging
        const generatedText = data.generations[0]?.text || 'No description generated';
        res.json({ description: generatedText });
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for image generation
app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'No prompt provided' });
    }

    try {
        const response = await fetch(imageModelURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hfAPIKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        const contentType = response.headers.get('content-type');
        console.log('Response Content-Type:', contentType);  // Log content type for debugging

        if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            const base64Image = imageBuffer.toString('base64');
            console.log('Generated Image Response:', base64Image);  // Log the generated image for debugging
            res.json({ image: `data:image/jpeg;base64,${base64Image}` });
        } else {
            const errorData = await response.json();
            console.error('Hugging Face Image API Error:', errorData);
            res.status(500).json({ error: errorData.error || 'Unexpected response from Hugging Face' });
        }
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
