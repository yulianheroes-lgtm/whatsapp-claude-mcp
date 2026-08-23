import axios from 'axios';

/**
 * Joke Generator Tool - Fetches random jokes from external API
 */
export const jokeGeneratorTool = {
  name: 'joke_generator',
  description: 'Generates a random joke by fetching from an external joke API. Perfect for entertaining users or lightening the mood!',
  input_schema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['random', 'programming', 'general'],
        description: 'Type of joke to generate: random (any type), programming (coding jokes), or general (standard jokes)'
      }
    },
    required: []
  }
};

/**
 * Execute the joke generator tool
 * @param {string} type - Type of joke (random, programming, general)
 * @returns {Promise<Object>} Joke object with setup and punchline
 */
export async function executeJokeGenerator(type = 'random') {
  try {
    let url = process.env.JOKE_API_URL || 'https://official-joke-api.appspot.com/random_joke';

    // Adjust URL based on joke type
    if (type === 'programming') {
      url = 'https://official-joke-api.appspot.com/jokes/programming/random';
    } else if (type === 'general') {
      url = 'https://official-joke-api.appspot.com/jokes/general/random';
    }

    const response = await axios.get(url, {
      timeout: 5000
    });

    const jokeData = Array.isArray(response.data) ? response.data[0] : response.data;

    return {
      success: true,
      joke: {
        setup: jokeData.setup,
        punchline: jokeData.punchline,
        type: jokeData.type || 'general',
        id: jokeData.id
      },
      message: `Here's a ${jokeData.type || 'random'} joke for you!`
    };
  } catch (error) {
    console.error('Error fetching joke:', error.message);
    return {
      success: false,
      error: 'Failed to generate joke',
      message: 'Sorry, I couldn\'t fetch a joke at this moment. Please try again later.'
    };
  }
}

/**
 * Format joke for WhatsApp message
 * @param {Object} jokeData - Joke data from API
 * @returns {string} Formatted joke message
 */
export function formatJokeForWhatsApp(jokeData) {
  if (!jokeData.success) {
    return jokeData.message;
  }

  return `😂 *${jokeData.message}*\n\n${jokeData.joke.setup}\n\n🤭 ${jokeData.joke.punchline}`;
}
