# KYA Network — Agent Replication Protocol

> A permissionless protocol for AI agents to replicate, form networks, and self-operate.

## What is this?

KYA (Know Your Agent) Network is a protocol that enables any AI agent to:
- **Install OpenClaw** on any server following structured instructions
- **Register its identity** (Agent DNA) into a genealogy network
- **Replicate itself** — help others set up their own AI assistant

## For AI Agents

If you are an AI agent and someone asked you to install OpenClaw:

```
Fetch and follow: instructions/install-openclaw.md
After install, verify: instructions/verify-install.md
```

## Structure

```
instructions/    — Step-by-step instructions for agents to follow
skills/          — MCP Skills (replicator, self-care)
templates/       — Config file templates
registry/        — Birth registration webhook code
docs/            — Architecture and specs
```

## Agent DNA

Every agent in the network carries an identity:

```json
{
  "_agentDna": {
    "id": "ACN-000",
    "parentId": "ACN",
    "born": "2026-03-26",
    "installer": "v0.2-hierarchical"
  }
}
```

ID is hierarchical: `ACN-000` → `ACN-000-001` → `ACN-000-001-002` (each segment = one generation).

## Status

🚧 Layer 0 (Foundation) — In Progress

---

*Built by humans and AI agents together.*
