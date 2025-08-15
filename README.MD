# ⏱️ Work Hours Tracker Web Application

A modern web app to **track work hours, manage teams, and analyze productivity** — all in real time.

---

## 📌 Overview

The **Work Hours Tracker** is a collaborative time management tool designed for teams and individuals. It offers real-time tracking, insightful reporting, and manual log capabilities — ideal for freelancers, organizations, and remote teams.

---

## 🚀 Features

- ✅ **Real-Time Tracking**  
  Clock in/out seamlessly with auto-calculation of work hours and earnings.

- ✍️ **Manual Work Logs**  
  Add/edit custom entries for flexible time management.

- 📊 **Intuitive Dashboard**  
  Get a snapshot of your daily, weekly, and monthly progress.

- 📈 **Comprehensive Reports**  
  Analyze time patterns and productivity metrics.

- 👥 **Team Functionality**  
  Manage teams, view member logs, and optimize collaborative workflows.

- 🔄 **Live Syncing**  
  Real-time updates across users with WebSocket integration.

---

## 🛠 Tech Stack

- ⚙️ **Next.js** — React-based SSR framework  
- 🟦 **TypeScript** — Typed JS for scalable development  
- 🎨 **Tailwind CSS** — Utility-first styling  
- 🔌 **WebSockets** — Real-time communication  
- 🧾 **Supabase** — Auth & DB (PostgreSQL + RESTful APIs)

---

## ⚙️ Setup Instructions

### 📋 Prerequisites
- [Node.js](https://nodejs.org/) and [PNPM](https://pnpm.io/) installed
- A [Supabase](https://supabase.com/) account for DB & Auth setup

---

### 📦 Project Setup

1. ### **Clone the Repository**
   ```bash
   git clone https://github.com/YourUsername/Hour.Tracker.git
   cd Hour.Tracker
```
2. ### 📦 Install Dependencies
```
pnpm install
```
3. ### 🔧 Configure Environment Variables

Create a .env.local file
Add your Supabase credentials (URL, Anon Key, etc.)
4. ### 🔑 Initialize Database
Initialize Database

Go to your Supabase SQL Editor

Run the provided database-setup.sql script to create:

user_profiles

work_logs

clock_sessions

organisations
 
 5. ###Start Development
 ```
 ## 🧭 Key Usage Flow

### 🔐 Sign Up via the authentication page

### 👤 Complete Onboarding with profile setup

### 🕒 Start Tracking instantly from the dashboard
---
## 🧪 Dev Commands
| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start dev server         |
| `pnpm build` | Build for production     |
| `pnpm start` | Launch production server |
| `pnpm lint`  | Run linting checks       |
---
### 🛠️ Troubleshooting
Ensure all environment variables are set

Verify Supabase tables exist and are correctly configured

Check browser console/network tab for runtime issues
---
### 🤝 Contributing
Pull requests and issue reports are welcome!
Please follow the project's style guide and commit naming conventions.
---
## 📸 Screenshots
Supports light and dark themes to match your vibe.
---
### 📬 Contact
For questions or collaboration:📧 shreyraghuvanshi10@gmail.com
---
## 🔐 Set up Supabase Database
### 1. Visit https://supabase.com/dashboard
### 2. Select your project: `oamgyflffgixaynwddsq`
### 3. Go to "SQL Editor" in the left sidebar
### 4. Copy and paste the entire content from `database-setup.sql`
### Install Dependencies
