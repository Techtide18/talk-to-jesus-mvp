# Talk to Jesus AI - Project Overview

**An AI-powered spiritual companion app that lets you talk to Jesus through text, voice, or video.**

---

## What Is This?

Talk to Jesus AI is a web application where users can have meaningful conversations with an AI representation of Jesus. The app offers four different ways to interact:

1. **💬 Text Chat** - Type your thoughts and receive written responses
2. **🎙️ Voice Call** - Speak naturally and hear Jesus respond with a realistic voice
3. **📞 Phone Call** - Experience a phone-call style conversation
4. **📹 Video Call** - See and talk to a photorealistic digital avatar of Jesus

---

## How It Works

### For Users
1. **Login** with credentials (can add googleAuth, facebookAuth, etc. later)
2. **Choose a mode** from the home screen
3. **Start talking** - type, speak, or have a video conversation
4. **Your conversations are saved** automatically in your browser

### Behind the Scenes
- **AI Brain:** Uses GPT-4.1 to generate compassionate, wise responses
- **Voice:** ElevenLabs creates realistic speech (Voice & Phone modes)
- **Video Avatar:** HeyGen provides a lifelike talking avatar (Video mode)
- **Storage:** Conversations saved in your browser (no Database connection yet)

---

## Technology Used

### What We Built With
- **Next.js** - Modern web framework
- **React** - User interface library
- **TypeScript** - Programming language
- **Tailwind CSS** - Styling

### AI Services We Use
- **OpenRouter** - Provides the AI "brain" (GPT-4.1)
- **ElevenLabs** - Creates realistic voice
- **HeyGen** - Powers the video avatar

---

## Features

### ✅ What Works Now
- Four different conversation modes
- Natural, compassionate AI responses
- Realistic voice and video
- Conversation history saved locally
- Beautiful, spiritual design
- Works on desktop browsers

### ⚠️ Current Limitations
- Simple login (not production-ready)
- Conversations only saved in your browser
- Voice services have usage limits
- No mobile app yet

---

### Required API Keys
You need accounts and API keys from:
- **OpenRouter** (for AI responses)
- **ElevenLabs** (for voice)
- **HeyGen** (for video avatar)

---

## Future Improvements

- [ ] Proper user accounts and login
- [ ] Save conversations to the cloud database
- [ ] Mobile app version
- [ ] Multiple languages
- [ ] Offline mode
- [ ] Share conversations with friends
- [ ] Users can create their own avatar and voice for jesus

---

**Version:** 0.1.0 (MVP)  
**Last Updated:** November 23, 2025