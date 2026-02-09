
export const CHAT_CONFIG = {
  initialMessages: [
    {
      id: 1,
      sender: "system",
      text: "Welcome to MiFiX Studio. I am your Supervisory Agent. You can mention specific experts using '@'."
    }
  ],
  systemResponses: {
    processing: "Analyzing complexity... delegating to selected specialists.",
    status: "System is online. All 32 agents are operational. Neural links stable.",
    unknownCommand: (cmd) => `Unknown command: ${cmd}. Type /help for a list of commands.`,
    agentsList: (agents) => `Available Agents: ${agents}`,
    clear: "Chat history cleared. Ready for new instructions."
  },
  commands: {
    HELP: '/help',
    CLEAR: '/clear',
    AGENTS: '/agents',
    STATUS: '/status'
  },
  placeholders: {
    input: "Type @ to mention an agent...",
    footer: "MiFiX AI can make mistakes. Review generated blueprints."
  },
  labels: {
    user: "YOU",
    system: "SUPERVISORY AGENT"
  }
};

export const HELP_CONTENT = {
  title: "Supervisory Capabilities & Commands",
  items: [
    { cmd: "/help", desc: "Show this help menu" },
    { cmd: "/clear", desc: "Clear current chat history" },
    { cmd: "/agents", desc: "List all available specialized agents" },
    { cmd: "/status", desc: "Check system operational status" }
  ],
  footer: "You can also mention agents directly using @AgentName to delegate specific tasks."
};
