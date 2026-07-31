# Voice System Architecture & Technical Report - CollegeMate AI

## Overview
This document outlines the voice architecture implemented for **CollegeMate AI**, covering both **Speech Recognition (Speech-to-Text)** and **Speech Synthesis (Text-to-Speech)**.

---

## 1. Speech Recognition (Voice Input)

- **Engine**: `window.SpeechRecognition` / `window.webkitSpeechRecognition`
- **Supported Browsers**: Google Chrome, Microsoft Edge, Brave, Opera, Safari.
- **Permission Handling**: Requests microphone permissions (`navigator.mediaDevices.getUserMedia`). Displays user-friendly permission error banner with retry controls if access is blocked.
- **Real-time Transcription**: Transcribes spoken words dynamically and inserts text directly into the chat input bar.
- **Visual Feedback**: Pulsing red record indicator, timer countdown, and an 8-bar animated soundwave responding to speech state.

---

## 2. Speech Synthesis (Voice Output)

- **Engine**: `window.speechSynthesis` + Provider Priority Chain (Google Neural / Azure / ResponsiveVoice / Native Browser).
- **Speaker Button on AI Responses**: Every assistant chat bubble features a Speaker Icon (`<Volume2 />`). Clicking the icon reads the AI response aloud while highlighting the active message.
- **Speech Controls**:
  - **Play**: Initiates speech synthesis for the AI answer.
  - **Pause**: Temporarily pauses active playback (`speechSynthesis.pause()`).
  - **Resume**: Continues playback (`speechSynthesis.resume()`).
  - **Stop**: Cancels active speech (`speechSynthesis.cancel()`).
  - **Voice Selection**: Choose between installed English and Tamil system voices.
  - **Speed & Pitch**: Adjust speech rate (0.5x–2.0x) and pitch (0.5x–1.5x).

---

## 3. Verification

- Tested microphone recording and real-time transcription.
- Verified speaker button speech playback and cancellation across messages.
- Verified TypeScript compilation and React rendering.
