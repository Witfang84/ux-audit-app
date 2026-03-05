# ux-audit-app

A UX audit tool powered by Claude AI, with both web and Figma plugin interfaces.

## Quick Start

### 1. Setup API Key

This app uses the Anthropic Claude API. You need an API key for testing/development:

1. Get your API key from: https://console.anthropic.com/account/keys
2. Create `.env.local` in the root directory (copy from `.env.local.example` if needed):
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
   ```
3. Replace with your actual API key

**Note:** The `.env.local` file is already in `.gitignore` — your key won't be committed to git.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

**Web App only:**
```bash
npm run web
```
Opens at http://localhost:5173

**Plugin only:**
```bash
npm run plugin
```

**Both (in separate terminals):**
```bash
npm run web      # Terminal 1
npm run plugin   # Terminal 2
```

## How It Works

- **Web App** (`/web`): Standalone UI audit interface. Upload images or analyze UI designs from context.
- **Plugin** (`/plugin`): Figma plugin. Select frames in Figma and audit them directly.

Both use the same Claude-powered analysis engine with multiple specialized agents (Heuristics, Dark Patterns, Accessibility, Design Flaws).

## API Key Handling

- The API key is loaded from `.env.local` automatically
- **Web app**: Key is accessible via `import.meta.env.VITE_ANTHROPIC_API_KEY`
- **Plugin**: Same variable, also loaded automatically
- You won't be asked for the key every time you run the app
- To change the key, edit `.env.local` and restart
- To temporarily use a different key, you can click "API KEY" button in the plugin UI (web app on next update)

## Development

- **Monorepo structure** using npm workspaces
- **Web**: React + Vite
- **Plugin**: React + Vite + Figma Plugin SDK
- **Build**: Vite for web, bun for plugin code compilation (with webpack fallback)