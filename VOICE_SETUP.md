# Voice System Integration & Setup - CollegeMate AI

## Overview
This document details the voice system implementation in **CollegeMate AI**, providing both **Speech-to-Text (Voice Input)** and **Text-to-Speech (Voice Output)** functionality using standard Web Speech APIs.

---

## 1. Speech Recognition (Voice Input / Speech to Text)

### Components & Hooks
- **Hook**: `frontend/src/hooks/useVoiceSystem.ts`
- **UI Components**:
  - `VoiceButton.tsx`: Mic button in the chat input bar with pulsing active state.
  - `VoiceRecorder.tsx`: Overlay displaying listening status, duration timer, animated soundwave visualization, cancel button, and finish/submit button.

### Features & Capabilities
1. **Microphone Permission Handling**: Prompts user for microphone access (`navigator.mediaDevices.getUserMedia`). Displays friendly toast notifications if access is denied.
2. **Real-time Speech Recognition**: Uses `webkitSpeechRecognition` / `SpeechRecognition` to transcribe spoken words directly into the chat input box in real time.
3. **Listening & Waveform Animations**: Displays pulsing ripple rings and 8-bar animated soundwave bars reflecting active listening state.
4. **Keyboard Shortcuts**:
   - `Space`: Start / Stop recording
   - `Escape`: Cancel recording
   - `Ctrl + M`: Mute / Stop speech output

---

## 2. SpeechSynthesis (Voice Output / Text to Speech)

### Service & Implementation
- **Service**: `frontend/src/services/ttsService.ts`
- **Component**: `VoicePlayer.tsx` & `ChatMessage.tsx` (Speaker Icon on AI messages)

### Features & Capabilities
1. **Speaker Icon on Every AI Response**: Every assistant chat bubble renders a speaker icon (`<Volume2 />`). Clicking the icon reads the AI response aloud.
2. **Controls**:
   - **Play / Speak**: Starts reading text aloud.
   - **Pause**: Pauses active speech synthesis (`window.speechSynthesis.pause()`).
   - **Resume**: Resumes paused speech synthesis (`window.speechSynthesis.resume()`).
   - **Stop**: Cancels active speech (`window.speechSynthesis.cancel()`).
3. **Voice Settings Panel** (`VoiceSettingsPanel.tsx`):
   - **Voice Selection**: Dropdown selecting installed system voices (English, Tamil, etc.).
   - **Speech Speed**: Slider adjusting speech rate (0.5x to 2.0x).
   - **Speech Pitch**: Slider adjusting voice pitch (0.5x to 1.5x).
   - **Volume**: Master volume slider (0% to 100%).
   - **Auto Speak**: Toggle to automatically read AI responses aloud upon completion.

---

## 3. Usage Example

```typescript
import { useVoiceSystem } from '../hooks/useVoiceSystem';

const { speakText, stopSpeech, pauseSpeech, resumeSpeech, voiceSettings } = useVoiceSystem();

// Read AI response aloud
speakText("Welcome to Mount Zion College of Engineering and Technology!");
```
