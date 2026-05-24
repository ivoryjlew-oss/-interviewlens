# InterviewLens

**AI-powered interview teleprompter, live coaching assistant, and session tracker.**

Created by **Ivory Lewis** · [Launch App](https://ivoryjlew-oss.github.io/-interviewlens/)

-----

## What It Does

InterviewLens is a personal interview preparation and live coaching tool built for job seekers who want to show up confident, prepared, and fully themselves. It combines a hands-free teleprompter, AI-generated scripts, real-time response coaching, and interview session recording — all in one place, running entirely in your browser with no downloads or installs required.

-----

## Install as an App (Recommended)

InterviewLens is a Progressive Web App (PWA), which means you can install it directly on your device and use it like a native app — full screen, no browser bar, available from your home screen.

### iPhone & iPad (Safari)

1. Open <https://ivoryjlew-oss.github.io/-interviewlens/> in **Safari**
1. Tap the **Share** button (the box with an arrow pointing up)
1. Scroll down and tap **Add to Home Screen**
1. Tap **Add** in the top right corner
1. InterviewLens will appear on your home screen and open like a native app

> ⚠️ This must be done in Safari — Chrome and other browsers on iPhone/iPad do not support Add to Home Screen for PWAs.

### Android (Chrome)

1. Open the site in **Chrome**
1. Tap the three-dot menu in the top right
1. Tap **Add to Home Screen** or **Install App**
1. Tap **Install**

### Desktop (Chrome or Edge)

1. Open the site in Chrome or Edge
1. Look for the install icon (⊕) in the address bar
1. Click it and follow the prompts

-----

## Getting Started

1. Open the app or visit <https://ivoryjlew-oss.github.io/-interviewlens/>
1. Enter your Anthropic API key when prompted — get a free one at [console.anthropic.com](https://console.anthropic.com)
1. Optionally set a 4-digit PIN to lock the app on your device
1. Fill in **My Profile** with your background and experience for personalized AI responses
1. Generate a script in **AI Builder**, rehearse it in the **Teleprompter**, then use **Live Q&A** during your next interview

-----

## Features

### 📄 Teleprompter

Scroll your script hands-free during video interviews.

- Adjustable scroll speed and font size (S / M / L / XL)
- 6 readability-optimized fonts including Atkinson Hyperlegible and Lexend
- Mirror mode for teleprompter glass setups
- Transparent background overlay mode for use during live calls
- Named script library — save multiple scripts for different roles and companies
- Keyboard shortcuts: Space to start/stop · ↑/↓ to adjust speed · R to reset

### ✦ AI Script Builder

Generate a tailored, natural-sounding interview script based on your background and the role.

- 4 script types: Tell me about yourself · Why this company · Closing statement · Full script
- Upload your resume, cover letter, or job description to enrich the output
- Send generated scripts directly to the teleprompter in one tap
- Export as TXT or PDF

### ⚡ Live Q&A

Type any question the interviewer asks and receive an AI-coached response in real time.

- **Mood detection** — analyzes the interviewer’s tone (Positive, Skeptical, Engaged, Pressuring, and more) and adapts the response style accordingly
- **Follow-up awareness** — detects when questions build on prior topics and responds with depth rather than repetition
- **Auto-stop** — listens for interview-ending phrases and automatically saves the session
- Full conversation history stays on screen for the duration of the session
- Export sessions as TXT or formatted PDF

### 📁 Sessions

Every Live Q&A session is automatically saved and organized by company.

- Browse sessions by company with mood timelines and full Q&A transcripts
- View, download, or delete individual sessions or entire company histories
- Export any session as a formatted PDF for review

### 👤 My Profile

Enter your background once and the AI uses it across every feature.

- Name, title, professional summary, core strengths, personality style, and work history
- Upload documents (resume, cover letters) to give the AI richer context
- Set your default AI persona

### 🎭 6 AI Personas

Choose the voice and style that fits the moment — switchable at any time, even mid-interview.

|Persona          |Style                                  |
|-----------------|---------------------------------------|
|🎯 Interview Coach|Structured, STAR-method, professional  |
|🤝 Peer Mentor    |Warm, conversational, encouraging      |
|♟ Strategist     |Analytical, positioning-focused        |
|📖 Story Coach    |Narrative-driven, vivid, memorable     |
|💼 Executive      |Concise, authoritative, high-signal    |
|💛 Empathy-First  |Human-centered, emotionally intelligent|

-----

## API Key

InterviewLens uses Anthropic’s Claude AI to power its smart features. You need your own free API key to use them.

1. Go to [console.anthropic.com](https://console.anthropic.com) and create a free account
1. Navigate to **API Keys** and click **Create Key**
1. Copy the key (it starts with `sk-ant-`) and paste it into InterviewLens when prompted
1. Check **Remember key on this device** so you only have to do this once

> 🔒 Your API key is stored only in your browser on your device. It is never sent to or stored by InterviewLens — only sent directly to Anthropic when you use AI features.

-----

## Privacy

All your data — profile, scripts, API key, and session history — is stored exclusively in your browser’s local storage on your own device. Nothing is transmitted to or stored on any external server controlled by Ivory Lewis. AI features communicate directly with Anthropic’s API using your own key.

-----

## Tech Stack

- Pure vanilla HTML, CSS, and JavaScript — no frameworks, no build step required
- Anthropic Claude API (claude-sonnet-4) for all AI features
- Progressive Web App (PWA) with service worker for offline support
- Google Fonts for typography
- Hosted on GitHub Pages

-----

## Legal

© 2026 Ivory Lewis. All rights reserved.

InterviewLens is an original work created by and belonging to Ivory Lewis, protected under United States copyright law (17 U.S.C. § 101 et seq.) and applicable international treaties.

**This application may not be copied, reproduced, redistributed, modified, or used for commercial purposes without the express written permission of Ivory Lewis.**

For licensing inquiries, please contact the creator directly.

-----

*InterviewLens — built to help you walk in prepared and walk out confident.*
