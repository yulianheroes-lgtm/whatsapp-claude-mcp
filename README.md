
# WhatsApp Claude MCP

A powerful WhatsApp bot integrated with Claude AI using the Model Context Protocol (MCP). Send messages to your WhatsApp bot and get intelligent responses powered by Claude, with access to external APIs and tools.

## 🌟 Features

- **Claude AI Integration**: Uses Claude 3.5 Sonnet for intelligent conversations
- **MCP Tools**: Extensible tool system for Claude to interact with external APIs
- **Joke Generator**: Built-in tool that fetches random jokes from external API
- **Conversation Memory**: Maintains context across multiple messages per user
- **WhatsApp Webhook**: Simple REST API for integrating with WhatsApp services
- **Easy Deployment**: Works with express server, ready for cloud deployment

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API Key (get from [console.anthropic.com](https://console.anthropic.com))
- WhatsApp Cloud API access (for production integration)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yulianheroes-lgtm/whatsapp-claude-mcp.git
cd whatsapp-claude-mcp
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000
```

### 3. Start the Server

```bash
npm start
```

You should see:
```
✅ WhatsApp Claude MCP Server running on http://localhost:3000
🤖 Ready to process WhatsApp messages!
```

## 📡 API Usage

### Health Check

```bash
curl http://localhost:3000/health
```

### Send Message to Claude

```bash
curl -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1234567890",
    "message": "Tell me a joke"
  }'
```

**Response:**
```json
{
  "success": true,
  "userId": "1234567890",
  "message": "😂 Here's a programming joke for you!\n\nWhy do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛"
}
```

### Clear Conversation History

```bash
curl -X POST http://localhost:3000/webhook/clear-history \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1234567890"
  }'
```

## 🛠️ Available Tools

### Joke Generator

Claude can automatically use this tool when appropriate:

- **Trigger**: When user asks for jokes
- **Types**: random, programming, general
- **API**: [Official Joke API](https://official-joke-api.appspot.com/)

**Example interaction:**
```
User: Tell me a funny programming joke
Bot: [Uses joke_generator tool] 😂 Here's a programming joke...
```

## 📁 Project Structure

```
whatsapp-claude-mcp/
├── src/
│   ├── index.js              # Main Express server
│   ├── whatsapp-handler.js   # Message handling & Claude integration
│   ├── mcp-server.js         # MCP tool definitions & execution
│   └── tools/
│       └── joke-generator.js # Joke generator tool implementation
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔌 Integration with WhatsApp

### Option 1: WhatsApp Cloud API

For production, integrate with WhatsApp Cloud API:

1. Set up webhook on Meta Business Platform
2. Point webhook URL to: `https://your-domain.com/webhook/whatsapp`
3. When WhatsApp sends messages, forward them to this endpoint

### Option 2: Local Testing

Use tools like `curl`, Postman, or a test script to send messages:

```javascript
// test.js
const userId = '1234567890';
const message = 'Tell me a joke';

const response = await fetch('http://localhost:3000/webhook/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, message })
});

const result = await response.json();
console.log(result.message);
```

## 🧠 How It Works

1. **Message Received** → WhatsApp webhook receives a message
2. **Claude Processing** → Message sent to Claude with available tools
3. **Tool Selection** → Claude decides if tools are needed
4. **Tool Execution** → MCP server executes tools (e.g., fetch jokes)
5. **Response Generation** → Claude generates response using tool results
6. **Message Sent** → Response sent back via WhatsApp

## 🚀 Adding More Tools

To add a new tool (e.g., weather, translations):

### 1. Create Tool File

```javascript
// src/tools/weather.js
export const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City name' }
    }
  }
};

export async function executeWeather(location) {
  // Fetch weather data
  return { /* weather data */ };
}
```

### 2. Register in MCP Server

```javascript
// src/mcp-server.js
import { weatherTool, executeWeather } from './tools/weather.js';

export class MCPServer {
  constructor() {
    this.tools = [
      jokeGeneratorTool,
      weatherTool  // Add here
    ];
  }

  async processTool(toolName, toolInput) {
    switch (toolName) {
      case 'get_weather':
        return await executeWeather(toolInput.location);
      // ...
    }
  }
}
```

## 📚 API Reference

### POST /webhook/whatsapp

**Request Body:**
```json
{
  "userId": "string (required)",
  "message": "string (required)"
}
```

**Response:**
```json
{
  "success": boolean,
  "userId": "string",
  "message": "string"
}
```

### POST /webhook/clear-history

**Request Body:**
```json
{
  "userId": "string (required)"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

## 🔐 Security Considerations

- **API Keys**: Never commit `.env` file to version control
- **Rate Limiting**: Consider adding rate limiting for production
- **Input Validation**: Always validate webhook payloads
- **HTTPS**: Use HTTPS in production
- **Authentication**: Add webhook signature verification for WhatsApp integration

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-...` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JOKE_API_URL` | Joke API endpoint | `https://official-joke-api.appspot.com/random_joke` |

## 🤝 Contributing

Feel free to fork, modify, and contribute back!

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### "API key not found"
- Ensure `.env` file exists and has `ANTHROPIC_API_KEY` set
- Check key is valid at [console.anthropic.com](https://console.anthropic.com)

### "Tool execution failed"
- Check external APIs are accessible
- Verify network connectivity
- Review error logs in console output

### "No response from Claude"
- Check `ANTHROPIC_API_KEY` is correct
- Ensure Claude model is available
- Check API rate limits

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Claude API documentation
3. Open an issue on GitHub

## 🎯 Future Enhancements

- [ ] Support for image/media in WhatsApp messages
- [ ] Additional tools (weather, news, translations)
- [ ] Database for persistent conversation history
- [ ] Rate limiting and authentication
- [ ] Admin dashboard for monitoring
- [ ] Multi-language support
- [ ] Custom Claude system prompts per user

---

**Made with ❤️ by yulianheroes-lgtm**
