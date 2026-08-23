import { jokeGeneratorTool, executeJokeGenerator, formatJokeForWhatsApp } from './tools/joke-generator.js';

/**
 * MCP Server Implementation
 * Defines tools available for Claude to use
 */
export class MCPServer {
  constructor() {
    this.tools = [
      jokeGeneratorTool
    ];
  }

  /**
   * Get all available tools
   * @returns {Array} Array of tool definitions
   */
  getTools() {
    return this.tools;
  }

  /**
   * Process tool calls from Claude
   * @param {string} toolName - Name of the tool to execute
   * @param {Object} toolInput - Input parameters for the tool
   * @returns {Promise<Object>} Result of tool execution
   */
  async processTool(toolName, toolInput) {
    console.log(`[MCP] Processing tool: ${toolName}`, toolInput);

    switch (toolName) {
      case 'joke_generator':
        return await executeJokeGenerator(toolInput.type || 'random');
      
      default:
        return {
          error: `Unknown tool: ${toolName}`,
          success: false
        };
    }
  }

  /**
   * Format tool result for Claude
   * @param {Object} toolResult - Raw tool result
   * @returns {string} Formatted result for Claude
   */
  formatToolResult(toolResult) {
    if (toolResult.success) {
      return JSON.stringify(toolResult);
    }
    return JSON.stringify(toolResult);
  }
}

export default MCPServer;
