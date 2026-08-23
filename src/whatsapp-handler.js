import Anthropic from '@anthropic-ai/sdk';
import MCPServer from './mcp-server.js';

/**
 * WhatsApp Message Handler
 * Processes messages and sends responses via Claude
 */
export class WhatsAppHandler {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.mcpServer = new MCPServer();
    this.conversationHistory = new Map(); // Store conversation history per user
  }

  /**
   * Process incoming WhatsApp message
   * @param {string} userId - User ID from WhatsApp
   * @param {string} message - User's message
   * @returns {Promise<string>} Response from Claude
   */
  async handleMessage(userId, message) {
    try {
      console.log(`[WhatsApp] New message from ${userId}: ${message}`);

      // Get or create conversation history for this user
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }

      const history = this.conversationHistory.get(userId);

      // Add user message to history
      history.push({
        role: 'user',
        content: message
      });

      // Call Claude with tools
      const response = await this.callClaudeWithTools(history);

      // Add assistant response to history
      history.push({
        role: 'assistant',
        content: response.finalResponse
      });

      // Keep conversation history manageable (last 20 messages)
      if (history.length > 40) {
        history.splice(0, 20);
      }

      return response.finalResponse;
    } catch (error) {
      console.error('[WhatsApp] Error handling message:', error);
      return "Sorry, I encountered an error processing your message. Please try again.";
    }
  }

  /**
   * Call Claude API with tools
   * @param {Array} messageHistory - Conversation history
   * @returns {Promise<Object>} Claude's response with tool results
   */
  async callClaudeWithTools(messageHistory) {
    const toolDefinitions = this.mcpServer.getTools();

    let response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      tools: toolDefinitions,
      messages: messageHistory,
      system: `You are a helpful WhatsApp bot assistant powered by Claude. 
You have access to various tools to help answer user queries.
When a user asks for something you can do with your tools, use them!
Keep responses concise and friendly for WhatsApp (short messages are better).
Use emojis appropriately to make conversations more engaging.`
    });

    // Handle tool use in a loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');
      
      if (!toolUseBlock) break;

      console.log(`[Claude] Using tool: ${toolUseBlock.name}`);

      // Execute the tool
      const toolResult = await this.mcpServer.processTool(
        toolUseBlock.name,
        toolUseBlock.input
      );

      // Add Claude's response and tool result to messages
      messageHistory.push({
        role: 'assistant',
        content: response.content
      });

      messageHistory.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(toolResult)
          }
        ]
      });

      // Call Claude again with tool results
      response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        tools: toolDefinitions,
        messages: messageHistory,
        system: `You are a helpful WhatsApp bot assistant powered by Claude.
You have access to various tools to help answer user queries.
Keep responses concise and friendly for WhatsApp.`
      });
    }

    // Extract final text response
    const finalResponse = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      finalResponse: finalResponse || "I wasn't able to generate a response. Please try again.",
      stopReason: response.stop_reason
    };
  }

  /**
   * Clear conversation history for a user
   * @param {string} userId - User ID
   */
  clearConversationHistory(userId) {
    this.conversationHistory.delete(userId);
    console.log(`[WhatsApp] Cleared history for user ${userId}`);
  }
}

export default WhatsAppHandler;
