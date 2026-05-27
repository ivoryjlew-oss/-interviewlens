# Phorya

**Go back, prepared. Get the job.**

> *“Your past, your power, your interview.”*

Created by **Ivory Lewis** · [Launch App](https://ivoryjlew-oss.github.io/Phorya/)

-----

## What Is Phorya?

Phorya is your AI-powered interview coach. Retrieve your past experiences, refine your responses in real time, and show up prepared, confident, and fully yourself — all in your browser.

The name *Phorya* draws from *Sankofa* — an Adinkra symbol from the Akan people of Ghana meaning “go back and get it.” It represents the wisdom of drawing from your past to build your future. In interviews, your lived experience is your greatest asset. Phorya helps you retrieve it, shape it, and speak it confidently.

-----

## Install as an App (Recommended)

Phorya is a Progressive Web App (PWA). Install it on your device for a full-screen, native app experience with no browser bar.

### iPhone & iPad (Safari only)

1. Open <https://ivoryjlew-oss.github.io/Phorya/> in **Safari**
1. Tap the **Share** button (the box with an arrow pointing up)
1. Scroll down and tap **Add to Home Screen**
1. Tap **Add**

> ⚠️ This must be done in Safari. Chrome and other browsers on iPhone and iPad do not support PWA installation.

### Android (Chrome)

1. Open the site in **Chrome**
1. Tap the three-dot menu → **Add to Home Screen** or **Install App**
1. Tap **Install**

### Desktop (Chrome or Edge)

1. Open the site in Chrome or Edge
1. Click the install icon (⊕) in the address bar
1. Follow the prompts

-----

## First-Time Setup

When you open Phorya for the first time, a 3-step setup guides you in:

**Step 1 — Choose your AI provider**
Select which AI model powers your experience. No provider is pre-selected — you choose. Five cloud providers are supported plus Ollama for local AI. Gemini has a free tier and is a great starting point — see the API Key Guide below.

**Step 2 — Enter your API key(s)**
Your primary provider’s key is required. All others are optional and can be added later in the ⚙️ AI tab. Each provider has a direct link to get your key. Your key is verified before you proceed. All AI features — script generation, Live Q&A, mood detection, and the AI Personality Summary — use whichever provider you have selected.

**Step 3 — Preferences**
Choose whether to remember your keys on the device and optionally set a 4-digit PIN to lock the app.

You can switch providers and manage all your keys anytime from the **⚙️ AI** tab. Replay the welcome tour anytime via the **✦ Tour** link in the footer.

-----

## API Key Guide

Phorya uses AI through your own API key — your data goes directly to the provider and nowhere else.

### Free Options

**Google Gemini — Free tier, no credit card required**

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
1. Sign in with your Google account
1. Click **Create API Key**
1. Copy the key and paste it into Phorya

- Free tier: 60 requests/minute, no cost
- Takes about 2 minutes with a Google account

**Ollama — Completely free, runs on your computer**
Ollama runs AI models locally on your own machine. No account, no API key, no cost, fully private.

1. Download from [ollama.com](https://ollama.com)
1. Install and run: `ollama run llama3`
1. In Phorya’s ⚙️ AI tab, select Ollama and enter `http://localhost:11434`

- Requires a reasonably modern computer (8GB+ RAM recommended)
- Works offline once the model is downloaded
- Popular models: Llama 3, Mistral, Gemma

### Paid Options (Affordable)

|Provider            |Where to Get Your Key                                                   |Notes                                       |
|--------------------|------------------------------------------------------------------------|--------------------------------------------|
|🎯 Claude (Anthropic)|[console.anthropic.com](https://console.anthropic.com)                  |Best quality, ~$5 lasts hundreds of sessions|
|🤖 OpenAI (GPT)      |[platform.openai.com/api-keys](https://platform.openai.com/api-keys)    |GPT-4o and GPT-4o-mini                      |
|🌊 Mistral           |[console.mistral.ai](https://console.mistral.ai)                        |Fast and affordable                         |
|🔍 DeepSeek          |[platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)|Very affordable                             |


> 🔒 All API keys are stored only in your browser on your device. They are sent directly to the provider when you use AI features. Phorya never sees or stores them.

-----

## AI Providers Supported

|Provider            |Models Available                                  |
|--------------------|--------------------------------------------------|
|🎯 Claude (Anthropic)|claude-sonnet-4, claude-opus-4-5, claude-haiku-4-5|
|🤖 OpenAI (GPT)      |gpt-4o, gpt-4o-mini, gpt-4-turbo                  |
|💎 Google Gemini     |gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash|
|🌊 Mistral           |mistral-large, mistral-medium, open-mistral-7b    |
|🔍 DeepSeek          |deepseek-chat, deepseek-reasoner                  |
|🖥️ Ollama (Local)    |Any locally installed model                       |

-----

## Features

### 📄 Teleprompter

Scroll your script hands-free during video interviews.

- **Rich text editor** — format your script with bold, italic, underline, custom fonts, and sizes. Select any text for a floating formatting toolbar
- Adjustable scroll speed and font size presets (S / M / L / XL)
- 6 readability-optimized fonts including Atkinson Hyperlegible and Lexend
- Mirror mode for teleprompter glass setups
- Transparent overlay mode for use during live calls
- **Named script library** — save and switch between multiple named scripts for different roles and companies
- Keyboard shortcuts: Space to start/stop · ↑/↓ arrows to adjust speed · R to reset

### ✦ AI Script Builder

Generate a tailored, natural-sounding script for any interview question in seconds.

**13 question types, ordered from most to least common:**

|Most Common                        |Common                                 |Scripts                 |
|-----------------------------------|---------------------------------------|------------------------|
|Tell me about yourself             |Where do you see yourself in 5 years?  |Why this company? (full)|
|What are your greatest strengths?  |Tell me about a time you made a mistake|Closing statement       |
|What are your weaknesses?          |Why are you leaving your current job?  |Full interview script   |
|What interests you about this role?|How do you prioritize your work?       |                        |
|Why do you want to work here?      |What do you know about the company?    |                        |
|Tell me about a challenge at work  |                                       |                        |
|What are your salary requirements? |                                       |                        |

- Upload resume, cover letter, or job description (TXT, PDF, DOC, DOCX, JPG, PNG)
- Send the generated script directly to the teleprompter in one tap
- Export as TXT or formatted PDF

### ⚡ Live Q&A

Get real-time AI coaching during your interview — type or speak the question.

- **🎤 Voice input** — tap the microphone button and speak the interviewer’s question. The app transcribes it automatically and sends it to the AI
- **Mood detection** — analyzes the interviewer’s tone (Positive, Skeptical, Engaged, Pressuring, Disengaged, Neutral) and adapts your response style in real time
- **Follow-up awareness** — detects when questions build on prior topics and responds with depth rather than repetition
- **Auto-stop** — listens for interview-ending phrases (“that’s all the questions,” “we’ll be in touch,” etc.) and automatically saves the session
- Full conversation history stays on screen for the duration of the session
- Export sessions as TXT or formatted PDF

### 📁 Sessions

Every Live Q&A session is automatically saved and organized by company.

- Browse sessions by company with mood timelines and full Q&A transcripts
- View, download (TXT or PDF), or delete individual sessions or entire company histories

### 👤 My Profile

Enter your background once — Phorya uses it to personalize AI responses across every feature.

- Name, title, professional summary, core strengths, personality style, and work history
- **MBTI** — full 16-type dropdown with type names (Analyst, Diplomat, Sentinel, Explorer)
- **Big Five** personality notes
- **Numerology** — Life Path, Expression, Soul Urge, and Destiny numbers
- **Astrology / Natal Chart** — Sun, Moon, Rising, Mercury, Venus, Mars placements, additional chart notes, and natal chart file upload
- **✦ AI Personality Summary** — tap Generate and the AI synthesizes your profile entries with published research on your MBTI, Big Five, numerology, and astrological types into a personalized paragraph you can read and use
- Upload documents (TXT, PDF, DOC, DOCX, JPG, PNG) — resume, cover letters, writing samples

### 🎭 6 AI Personas

Choose the voice and style that fits the moment. Switch anytime, even mid-interview.

|Persona          |Style                                  |
|-----------------|---------------------------------------|
|🎯 Interview Coach|Structured, STAR-method, professional  |
|🤝 Peer Mentor    |Warm, conversational, encouraging      |
|♟ Strategist     |Analytical, positioning-focused        |
|📖 Story Coach    |Narrative-driven, vivid, memorable     |
|💼 Executive      |Concise, authoritative, high-signal    |
|💛 Empathy-First  |Human-centered, emotionally intelligent|

### ⚙️ AI Provider Tab

Switch AI providers, manage API keys, select models, and test your connection without leaving the app. Supports all five cloud providers plus Ollama for local AI.

-----

## How to Update Files on GitHub

1. Go to `github.com/ivoryjlew-oss/Phorya`
1. Click **Add file → Upload files**
1. Drag in the updated files (rename `interviewlens-standalone.html` → `index.html` before uploading)
1. Click **Commit changes**
1. GitHub Pages rebuilds automatically within 1–2 minutes

Check the **Actions** tab for a green checkmark confirming the deploy is live.

-----

## How to Deploy on Vercel (Optional)

Vercel offers faster global delivery and auto-deploys every time you push to GitHub.

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
1. Click **Add New → Project** and select the `Phorya` repository
1. Under Framework Preset select **Other**
1. Leave Build Command and Output Directory blank
1. Click **Deploy**

Once connected, every GitHub update automatically redeploys to Vercel within ~30 seconds.

-----

## Privacy

All your data — profile, scripts, API keys, and session history — is stored exclusively in your browser’s local storage on your own device. Nothing is transmitted to or stored on any server controlled by Ivory Lewis. AI features communicate directly with your chosen provider using your own API key.

-----

## Tips Welcome

If Phorya has been helpful to you, tips are always appreciated 💚

- **Cash App:** [$ivoryjlew](https://cash.app/$ivoryjlew)
- **PayPal:** [paypal.me/IJL216](https://www.paypal.me/IJL216)

-----

## Tech Stack

- Pure vanilla HTML, CSS, and JavaScript — no frameworks, no build step required
- Web Speech API for voice input (Safari on iOS, Chrome on desktop)
- Supports Claude, OpenAI (GPT), Google Gemini, Mistral, DeepSeek, and Ollama (local)
- Progressive Web App (PWA) with service worker for offline support
- Google Fonts for typography
- Hosted on GitHub Pages

-----

## Legal

© 2026 Ivory Lewis. All rights reserved.

Phorya is an original work created by and belonging to Ivory Lewis, protected under United States copyright law (17 U.S.C. § 101 et seq.) and applicable international treaties.

**This application may not be copied, reproduced, redistributed, modified, or used for commercial purposes without the express written permission of Ivory Lewis.**

For licensing inquiries, please contact the creator directly.

-----

*Phorya — Go back, prepared. Get the job.*