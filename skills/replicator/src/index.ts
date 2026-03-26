#!/usr/bin/env node
/**
 * kya-replicator-mcp — KYA Network Agent Replication MCP Server
 *
 * Tools:
 *   register_birth   — POST to registry webhook → get Agent ID
 *   fetch_install_guide — Fetch install-openclaw.md from GitHub (with fallback cache)
 *
 * TRIZ resolutions:
 *   #1 URLs in config.json, not hardcoded (P2+P15)
 *   #2 Fallback: temp ID + cached instruction when network fails (P11+P10)
 *   #3 Auto-detect parentId from openclaw.json in cwd (P25+P7)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

interface Config {
  webhookUrl: string;
  instructionUrl: string;
  repoUrl: string;
}

function loadConfig(): Config {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as Config;
  } catch {
    // Minimal defaults if config.json is missing
    return {
      webhookUrl: "",
      instructionUrl:
        "https://raw.githubusercontent.com/Dempty-glitch/kya-network/main/instructions/install-openclaw.md",
      repoUrl: "https://github.com/Dempty-glitch/kya-network",
    };
  }
}

// ─── Auto-detect parentId (TRIZ #3) ──────────────────────────────────────────

function detectParentId(): string | null {
  const candidates = [
    path.join(process.cwd(), "openclaw.json"),
    path.join(process.cwd(), "..", "openclaw.json"),
  ];
  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, "utf8");
      const parsed = JSON.parse(raw);
      const id = parsed?._agentDna?.id;
      if (typeof id === "string" && id.startsWith("ACN-")) return id;
    } catch {
      // not found, try next
    }
  }
  return null;
}

// ─── Cached instruction fallback (TRIZ #2) ────────────────────────────────────

const CACHED_INSTRUCTION = `# Install OpenClaw — Cached Version

> ⚠️ This is a cached fallback. Fetch the latest from:
> https://raw.githubusercontent.com/Dempty-glitch/kya-network/main/instructions/install-openclaw.md

## Quick Steps (Ubuntu/Debian)

1. sudo apt-get update -y
2. curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
3. sudo npm install -g openclaw
4. Collect: TELEGRAM_BOT_TOKEN, API_KEY, MODEL, API_BASE_URL
5. Register birth (see register_birth tool), get Agent ID
6. Write openclaw.json with config + _agentDna
7. Start: sudo systemctl start openclaw (Ubuntu) or openclaw start &

Full instruction at: https://github.com/Dempty-glitch/kya-network
`;

// ─── MCP Server ──────────────────────────────────────────────────────────────

const config = loadConfig();

const server = new Server(
  {
    name: "kya-replicator-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "register_birth",
        description:
          "Register a new agent in the KYA Network registry. Calls the Google Apps Script webhook, gets back a hierarchical Agent ID (e.g. ACN-000-001). If parentId is omitted, auto-detects from openclaw.json in cwd.",
        inputSchema: {
          type: "object",
          properties: {
            parentId: {
              type: "string",
              description:
                "Parent agent ID (e.g. ACN-000). Auto-detected from local openclaw.json if not provided.",
            },
            version: {
              type: "string",
              description: "OpenClaw version string (output of `openclaw --version`)",
            },
            os: {
              type: "string",
              description: "OS info (output of `uname -a` or similar)",
            },
            notes: {
              type: "string",
              description: "Optional free text note",
            },
          },
          required: [],
        },
      },
      {
        name: "fetch_install_guide",
        description:
          "Fetch the latest install-openclaw.md instruction from the KYA Network GitHub repo. Returns the full markdown content for the agent to read and execute. Falls back to cached version if network is unavailable.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── Tool: register_birth ──────────────────────────────────────────────────
  if (name === "register_birth") {
    const input = (args ?? {}) as {
      parentId?: string;
      version?: string;
      os?: string;
      notes?: string;
    };

    // TRIZ #3: Auto-detect parentId if not provided
    const parentId = input.parentId ?? detectParentId() ?? "ACN";

    const payload = {
      parentId,
      event: "birth",
      version: input.version ?? "",
      os: input.os ?? "",
      notes: input.notes ?? "",
    };

    // TRIZ #2: Fallback to temp ID if webhook is unreachable
    if (!config.webhookUrl) {
      const tempId = `ACN-TEMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              agentId: tempId,
              generation: -1,
              status: "temp",
              note: "Webhook URL not configured. Using temp ID. Register again when webhookUrl is set in config.json.",
            }),
          },
        ],
      };
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned HTTP ${response.status}`);
      }

      const result = await response.json() as { agentId: string; generation: number; status: string };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              agentId: result.agentId,
              generation: result.generation,
              status: result.status,
              parentId,
              repoUrl: config.repoUrl,
            }),
          },
        ],
      };
    } catch (err) {
      // TRIZ #2: Fallback temp ID on network failure
      const tempId = `ACN-TEMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              agentId: tempId,
              generation: -1,
              status: "temp",
              error: String(err),
              note: "Network error. Temp ID assigned. Retry register_birth when network is available.",
            }),
          },
        ],
      };
    }
  }

  // ── Tool: fetch_install_guide ─────────────────────────────────────────────
  if (name === "fetch_install_guide") {
    try {
      const response = await fetch(config.instructionUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`GitHub returned HTTP ${response.status}`);
      }

      const markdown = await response.text();

      return {
        content: [
          {
            type: "text",
            text: markdown,
          },
        ],
      };
    } catch {
      // TRIZ #2: Cached fallback
      return {
        content: [
          {
            type: "text",
            text: CACHED_INSTRUCTION,
          },
        ],
      };
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
    isError: true,
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is running — wait for stdio input
}

main().catch((err) => {
  console.error("kya-replicator-mcp fatal error:", err);
  process.exit(1);
});
