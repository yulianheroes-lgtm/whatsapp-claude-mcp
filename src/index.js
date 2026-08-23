import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import WhatsAppHandler from './whatsapp-handler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize WhatsApp handler
const whatsappHandler = new WhatsAppHandler();

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WhatsApp Claude MCP is running' });
});

/**
 * Webhook endpoint for WhatsApp messages
 * POST /webhook/whatsapp
 * Body: { userId, message }
 */
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        error: 'Missing required fields: userId, message'
      });
    }

    console.log(`[API] Received message from ${userId}: ${message}`);

    // Process message with Claude
    const response = await whatsappHandler.handleMessage(userId, message);

    res.json({
      success: true,
      userId,
      message: response
    });
  } catch (error) {
    console.error('[API] Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Clear conversation history
 * POST /webhook/clear-history
 * Body: { userId }
 */
app.post('/webhook/clear-history', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    whatsappHandler.clearConversationHistory(userId);

    res.json({
      success: true,
      message: `Conversation history cleared for user ${userId}`
    });
  } catch (error) {
    console.error('[API] Error clearing history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp Claude MCP',
    version: '1.0.0',
    description: 'WhatsApp bot integrated with Claude AI using MCP',
    endpoints: {
      health: 'GET /health',
      webhook: 'POST /webhook/whatsapp',
      clearHistory: 'POST /webhook/clear-history'
    }
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`✅ WhatsApp Claude MCP Server running on http://localhost:${PORT}`);
  console.log(`📱 API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🤖 Ready to process WhatsApp messages!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
