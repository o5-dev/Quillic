# Quillic.ai

[![Version](https://img.shields.io/badge/version-0.0.1-C6613F?style=flat-square)](https://github.com/quillic/quillic)
[![License](https://img.shields.io/badge/license-MIT-3A3938?style=flat-square)](./LICENSE)
[![Discord](https://img.shields.io/discord/1234567890?label=Discord&color=C6613F&style=flat-square)](https://discord.gg/w3w268aDuM)

**A desktop AI coding assistant built for developers who want full control over their workflow.**

Quillic runs locally on your machine as a native desktop app. It connects to your project folder, understands your codebase, calls tools, runs terminal commands, and writes code — all from a single interface. No browser tab required.

---

<div align="center">

[![Download for Windows](https://img.shields.io/badge/Download%20for%20Windows-.exe-C6613F?style=for-the-badge)](https://github.com/quillic/quillic/releases)
[![Join Discord](https://img.shields.io/badge/Join%20Discord-Community-5865F2?style=for-the-badge)](https://discord.gg/w3w268aDuM)
[![View Releases](https://img.shields.io/badge/Releases-Changelog-3A3938?style=for-the-badge)](https://github.com/quillic/quillic/releases)

</div>

---

## Why Quillic

Most AI coding tools are either locked inside a browser, tied to a single provider, or designed around a specific editor. Quillic is none of those things.

It is a standalone desktop application that connects directly to your project on disk, runs a real terminal, reads and writes files, talks to Git, and lets you bring your own API keys from any supported provider. You choose the model. You own the keys. The AI has full context about your project structure and can act on it.

The interface is built around the idea that the AI should do the work, not narrate it. Code blocks are collapsed by default so you see results, not walls of text. Tool calls show you exactly what ran and what it produced. Thinking blocks let you inspect the reasoning if you want it, or ignore it if you don't.

---

## Features

### AI and Models

- Connect to **OpenRouter**, **NVIDIA NIM**, and **HuggingFace** with your own API keys
- Model selector grouped by provider with free/type/size tags — no clutter
- Locked models are clearly indicated and unclickable until a key is added
- Extended thinking mode — AI reasons step by step before answering, visible in a collapsible block
- Web search toggle — AI searches the web before answering when enabled
- Stop generation at any point with a single click

### Code and Files

- Collapsed code blocks by default, expandable on demand
- Syntax highlighting across Python, TypeScript, JavaScript, Rust, Go, HTML, CSS, SQL, YAML, Dockerfile, Bash, JSON, and more
- Code blocks display the filename and language, with copy and download buttons
- Built-in file editor in the right panel — click any file to open it, edit with autosave
- Line numbers, syntax colouring, and language detection from file extension
- Full project folder awareness — the AI sees your file tree and can navigate it

### Tools the AI Can Use

- Read, write, edit, move, copy, and delete files
- Run shell commands with output streamed back
- Execute code in Python, Node.js, or shell
- Search files by name or content
- Full Git integration — status, diff, add, commit, push, pull, log, checkout, clone
- GitHub API — list repos, create issues and pull requests
- Web search and URL fetching
- Public API directory access
- Obsidian vault search and read when a vault is connected

### Interface

- Native desktop app — Windows `.exe` and macOS `.dmg`
- Resizable sidebar, chat area, and right panel — drag any edge like window tabs
- Resizable terminal panel at the bottom
- Dark and light themes, both using the same terracotta accent
- Custom frameless titlebar
- Inline chart rendering — bar, line, pie, and area charts from AI output
- Markdown table rendering with zebra striping and horizontal scroll
- Attached file chips in the input and in sent messages — click to open in the editor

### Persistence and Management

- All chats stored in a local SQLite database
- Full message history reloaded when you open any past chat
- Chats grouped by Today, Yesterday, and Earlier
- Double-click to rename, right-click to delete
- Auto-title after first AI response
- Session token usage displayed per message and in the right panel footer

### Skills

- Upload Markdown skill files to shape how the AI responds
- Skills are loaded into the AI's system context every session
- Toggle skills on and off per session
- Useful for enforcing code style, domain conventions, or workflow patterns

### Obsidian Integration

- Connect your vault from Settings
- AI gains access to vault search and note reading tools once connected
- Vault context is injected into the system prompt only when connected — no leakage otherwise
- `/vault` slash command for quick note search

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=quillic/quillic&type=Date)](https://star-history.com/#quillic/quillic&Date)

---

## Getting Started

### Download

Grab the latest release for your platform from the [Releases page](https://github.com/quillic/quillic/releases).

- **Windows**: run the `.exe` installer, choose your install directory
- **macOS**: open the `.dmg` and drag Quillic to Applications

### Add an API Key

On first launch, open **Settings → Providers** and add at least one API key:

| Provider | Key format | Free models available |
|---|---|---|
| OpenRouter | `sk-or-v1-…` | Yes |
| NVIDIA NIM | `nvapi-…` | Yes |
| HuggingFace | `hf_…` | Yes |

Get keys at [openrouter.ai/keys](https://openrouter.ai/keys), [integrate.api.nvidia.com](https://integrate.api.nvidia.com), or [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

### Start a Chat

Click **New chat**, select a project folder when prompted, and start talking. The AI will have access to your file tree immediately.

---

## Building from Source

```bash
git clone https://github.com/quillic/quillic.git
cd quillic
npm install
npm run dev
```

To package:

```bash
# Windows
npm run package:win

# macOS
npm run package:mac
```

Requirements: Node.js 20+, npm 9+.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | Electron 30 |
| Frontend | React 18 + TypeScript |
| State | Zustand |
| Persistence | SQLite via better-sqlite3 |
| Terminal | node-pty + xterm.js |
| File editor | Monaco Editor |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm |
| Syntax highlighting | highlight.js |
| Build | Vite + electron-builder |

---

## Community

Questions, feedback, and ideas live in the Discord.

[![Join Discord](https://img.shields.io/badge/Join%20the%20Discord-5865F2?style=for-the-badge)](https://discord.gg/w3w268aDuM)

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
<sub>Quillic.ai — v0.0.1</sub>
</div>
