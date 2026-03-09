# LuminoLearn

An interactive coding game that teaches HTML, CSS, and JavaScript through hands-on challenges. Built with React, Vite, and Tailwind CSS.

## Features

- **4 Progressive Levels** – From beginner (Balloon Lift) to expert (Mini Quiz)
- **Live Code Editor** – HTML, CSS, and JS with instant preview
- **Quest System** – Earn XP and complete challenges
- **Flame Bot** – AI tutor powered by Gemini for hints and guidance
- **Asset Lab** – Generate custom graphics with AI (Imagen)
- **Dark/Light Theme** – Toggle between themes

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` and add your Gemini API key (for Flame Bot and Asset Lab):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   Get a key at [Google AI Studio](https://aistudio.google.com/apikey)

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript check |

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion (animations)
- Google GenAI (Gemini)

## License

Apache-2.0
