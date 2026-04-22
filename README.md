# 🧓 Smart Saathi — AI-Powered Elderly Care Companion

> *A voice-first, AI-powered mobile application designed to empower senior citizens with independent daily health management, instant emergency alerting, and a compassionate conversational companion.*

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase)](https://supabase.com)
[![Cohere AI](https://img.shields.io/badge/Cohere-AI%20Engine-FF6B35)](https://cohere.com)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [AI & Voice Pipeline](#-ai--voice-pipeline)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🌟 Overview

**Smart Saathi** (Hindi: *Smart Companion*) is a cross-platform Flutter application purpose-built for elderly users. It replaces complex, multi-step interfaces with a **single voice command** — seniors simply say *"Hey Saathi"* to activate the AI companion, which can add medications, log vitals, trigger emergencies, or simply have a caring conversation.

The app is designed around three core principles:

1. **Voice-First Interaction** — Every feature is accessible through natural language, no typing required.
2. **Safety by Default** — Distress detection and one-tap SOS with live GPS broadcasting to family nominees.
3. **Dignified Independence** — Seniors manage their own health (medications, vitals, reports) without constant caregiver intervention.

---

## ✨ Key Features

### 🎙️ Voice-First AI Companion ("Saathi")
- **Wake Word Activation** — Say *"Hey Saathi"* to activate hands-free voice control.
- **Natural Language Understanding** — Powered by Cohere AI with function-calling for structured actions (add medication, log vitals, trigger SOS).
- **Bilingual Support** — Seamless English/Hindi interaction with one-tap language switching.
- **Barge-In Detection** — Seniors can interrupt the AI mid-speech to issue new commands.
- **Distress Keyword Detection** — Automatically detects words like *"help"*, *"emergency"*, *"bachao"* and triggers SOS.

### 🆘 Emergency SOS System
- **One-Tap SOS Button** — Large, accessible emergency button on the home dashboard.
- **Voice-Triggered SOS** — Say *"help me"* or *"emergency"* to activate automatically.
- **GPS Location Broadcasting** — Sends live coordinates via **SMS and WhatsApp** to up to 3 registered family nominees.
- **Continuous Location Updates** — SOS broadcasts location every 30 seconds until manually stopped.
- **Direct Ambulance Dial** — One-tap call to emergency services (102).

### 💊 Medication Management
- **Voice-Powered Entry** — *"Add Paracetamol at 8 AM daily"* — AI extracts name, time, and frequency.
- **Manual Entry** — Bottom-sheet form with time picker and frequency selector.
- **OS-Level Notifications** — Background medication reminders via `flutter_local_notifications` with exact alarms.
- **Real-Time Sync** — Supabase Realtime streams keep medication lists updated across sessions.
- **Take/Skip Tracking** — Mark medications as taken with voice feedback confirmation.

### 💓 Vitals & Health Dashboard
- **Blood Sugar Logging** — Manual entry in mg/dL with trend visualization.
- **Blood Pressure Logging** — Systolic/Diastolic entry in mmHg with graphical charts.
- **Time-Range Filtering** — View vitals for Today, Week, Month, or 3 Months.
- **Interactive Charts** — Line graphs with `fl_chart` for trend analysis and daily aggregation.
- **Log & Graph Toggle** — Switch between tabular logs and visual charts.

### 📋 Health Reports
- **Multi-Page Report Capture** — Camera or gallery capture with multi-image support per report.
- **AI-Powered Summaries** — Reports are analyzed by Cohere AI to generate plain-language medical summaries.
- **Supabase Storage** — Reports stored securely in cloud storage with thumbnail previews.
- **Full-Screen Viewer** — Pinch-to-zoom multi-page report viewer with page indicators.

### 💧 Hydration Tracking
- **Daily Water Intake** — Log glasses of water with progress towards daily goal (8 glasses).
- **Visual Progress Ring** — Animated circular progress indicator on the home dashboard.
- **Voice Logging** — *"Log 2 glasses of water"* via Saathi voice companion.

### 🏥 Nearby Facilities Finder
- **GPS-Based Discovery** — Automatically detects user location and opens Google Maps for:
  - Hospitals, Pharmacies, Clinics, Physiotherapy centres
- **One-Tap Ambulance Call** — Direct dial to emergency number 102.

### 🔄 Auto-Update System
- **GitHub Releases Integration** — Checks for new APK versions via GitHub API.
- **In-App Update Dialog** — Prompts users to download the latest version with release notes.
- **Hourly Cooldown** — Rate-limited update checks to avoid excessive API calls.

### 👤 Profile & Nominee Management
- **Family Nominees** — Register up to 3 emergency contacts with WhatsApp numbers.
- **Guided Onboarding** — First-time nominee setup screen after signup.
- **Language Toggle** — Switch between English and Hindi with instant voice feedback.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FLUTTER APPLICATION                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │   Home    │  │   Meds    │  │ Wellbeing │  ...       │
│  │  Screen   │  │  Screen   │  │  Screen   │           │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘           │
│        │              │              │                   │
│  ┌─────▼──────────────▼──────────────▼─────┐            │
│  │            SERVICE LAYER                 │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │            │
│  │  │  Voice   │ │   AI     │ │   SOS    │ │            │
│  │  │ Service  │ │ Service  │ │ Service  │ │            │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ │            │
│  │  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ │            │
│  │  │Notif.    │ │Supabase  │ │ Update   │ │            │
│  │  │Service   │ │Service   │ │ Service  │ │            │
│  │  └──────────┘ └────┬─────┘ └──────────┘ │            │
│  └─────────────────────┼───────────────────┘            │
└─────────────────────────┼───────────────────────────────┘
                          │
          ┌───────────────▼───────────────┐
          │         SUPABASE BaaS         │
          │  ┌──────┐ ┌──────┐ ┌───────┐  │
          │  │ Auth │ │  DB  │ │Storage│  │
          │  │      │ │(PgSQL)│ │       │  │
          │  └──────┘ └──────┘ └───────┘  │
          │  ┌──────────────────────────┐  │
          │  │   Row Level Security     │  │
          │  │  (User data isolation)   │  │
          │  └──────────────────────────┘  │
          └───────────────────────────────┘
                          │
          ┌───────────────▼───────────────┐
          │        COHERE AI API          │
          │  ┌────────────────────────┐   │
          │  │  Intent Classification │   │
          │  │  Function Calling      │   │
          │  │  Report Summarization  │   │
          │  └────────────────────────┘   │
          └───────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Flutter 3.x (Dart) | Cross-platform UI (Android, iOS, Web) |
| **UI Framework** | Google Fonts (Poppins) | Consistent typography |
| **Navigation** | GoRouter | Declarative routing with auth guards |
| **State** | ChangeNotifier + Singletons | Lightweight reactive state management |
| **Backend** | Supabase | Auth, PostgreSQL, Realtime, Storage |
| **AI Engine** | Cohere API | NLU, intent classification, function calling |
| **Voice (STT)** | `speech_to_text` | On-device speech recognition |
| **Voice (TTS)** | `flutter_tts` | Text-to-speech with language switching |
| **Location** | `geolocator` | High-accuracy GPS for SOS |
| **Notifications** | `flutter_local_notifications` | OS-level medication reminders |
| **Charts** | `fl_chart` | Vitals trend visualization |
| **Messaging** | `url_launcher` | SMS & WhatsApp SOS broadcasting |
| **Camera** | `image_picker` | Health report capture |
| **Updates** | GitHub Releases API | In-app version checking |
| **Env Config** | `flutter_dotenv` | Secure API key management |

---

## 📁 Project Structure

```
lib/
├── main.dart                     # App entry point, initializations
├── app_router.dart               # GoRouter configuration with auth guards
│
├── models/
│   ├── medication.dart           # Medication data model
│   ├── vital_log.dart            # Blood sugar/pressure log model
│   ├── health_report.dart        # Multi-page health report model
│   ├── hydration_log.dart        # Daily water intake model
│   ├── wellbeing_log.dart        # Wellbeing tracking model
│   ├── nominee.dart              # Emergency contact model
│   └── sos_event.dart            # SOS event data model
│
├── services/
│   ├── supabase_service.dart     # Central data layer (CRUD, auth, storage)
│   ├── voice_service.dart        # STT/TTS, wake word, bilingual support
│   ├── ai_service.dart           # Cohere AI integration & function calling
│   ├── sos_service.dart          # Emergency GPS broadcasting (SMS/WhatsApp)
│   ├── notification_service.dart # OS-level medication reminders
│   └── update_service.dart       # GitHub-based auto-update checks
│
├── screens/
│   ├── app_shell.dart            # Bottom navigation bar shell
│   ├── home_screen.dart          # Main dashboard with voice, SOS, overview
│   ├── medications_screen.dart   # Medication list & voice-add
│   ├── wellbeing_screen.dart     # Vitals logging, charts, health reports
│   ├── nearby_facilities_screen.dart  # GPS-based hospital/pharmacy finder
│   ├── profile_screen.dart       # User profile, nominees, language toggle
│   ├── nominee_setup_screen.dart # First-time nominee onboarding
│   └── signup_screen.dart        # Authentication (email/password)
```

---

## 🚀 Getting Started

### Prerequisites

- [Flutter SDK](https://flutter.dev/docs/get-started/install) (version 3.11.0+)
- A [Supabase](https://supabase.com/) project
- A [Cohere](https://cohere.com/) API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tarun-hu/Smart-Saathi.git
   cd Smart-Saathi
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the project root:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   COHERE_API_KEY=your-cohere-api-key
   ```

4. **Set up Supabase database:**
   
   Run the SQL schema in `supabase_schema.sql` in your Supabase SQL Editor to create all required tables and RLS policies.

5. **Run the app:**
   ```bash
   # Android/iOS
   flutter run

   # Web
   flutter run -d chrome
   ```

---

## 🗄️ Database Schema

The application uses the following PostgreSQL tables with **Row Level Security (RLS)** ensuring complete data isolation per user:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profile data | `full_name`, `email`, `has_completed_setup` |
| `nominees` | Emergency contacts (up to 3) | `name`, `whatsapp_number`, `position` |
| `medications` | Medication schedules | `name`, `dosage`, `time`, `frequency`, `status` |
| `hydration_logs` | Daily water intake | `glasses`, `date` |
| `vital_logs` | Blood sugar & pressure | `type`, `value`, `systolic`, `diastolic` |
| `health_reports` | Medical report images | `name`, `image_urls[]`, `ai_summary` |
| `wellbeing_logs` | Daily wellbeing entries | `mood`, `sleep_hours`, `notes` |
| `sos_events` | Emergency event logs | `latitude`, `longitude`, `status` |

> **Security**: All tables enforce RLS policies where `auth.uid() = user_id`, ensuring users can only access their own data. No admin or caregiver role can see another user's records.

---

## 🤖 AI & Voice Pipeline

### Voice Command Flow

```
User speaks → STT (speech_to_text) → Text
                                       ↓
                              Wake Word Check ("Hey Saathi")
                                       ↓
                              Distress Keyword Scan
                              ("help", "emergency", "bachao")
                                       ↓  (if distress → SOS)
                              Cohere AI Processing
                                       ↓
                    ┌──────────────────┼──────────────────┐
                    ↓                  ↓                  ↓
              Tool Call           Conversation        Clarification
           (add_medication,     (friendly chat)      (ask follow-up)
            log_vitals, etc.)
                    ↓                  ↓                  ↓
              Execute Action      TTS Response        TTS Response
              + TTS Confirm       (flutter_tts)       (flutter_tts)
```

### Supported AI Tool Calls

| Tool | Trigger Example | Action |
|------|----------------|--------|
| `add_medication` | *"Add Crocin at 9 AM daily"* | Creates medication + schedules notification |
| `log_blood_sugar` | *"My sugar is 140"* | Logs blood sugar reading |
| `log_blood_pressure` | *"BP is 120 over 80"* | Logs systolic/diastolic values |
| `trigger_sos` | *"Help me!"* / *"Emergency"* | Activates SOS with GPS broadcasting |
| `log_water` | *"I drank 2 glasses of water"* | Updates hydration log |

### AI Persona

The AI companion ("Saathi") operates under a carefully designed system prompt:
- Speaks in a **warm, respectful tone** suited for elderly users
- Uses **short, clear sentences** avoiding medical jargon
- **Never provides medical diagnoses** — always recommends consulting a doctor
- Maintains **conversation memory** within a session
- Responds in the **user's preferred language** (English or Hindi)

---

## 📸 Screenshots

*Coming soon — the app features a warm, accessible UI with large touch targets, high-contrast colors, and senior-friendly typography powered by Google Fonts (Poppins).*

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <b>Smart Saathi</b> — Because every senior deserves a caring companion. 🤝
</div>
