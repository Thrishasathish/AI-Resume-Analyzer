# 🚀 ResumeAI — AI-Powered Resume Analyzer

A full-stack AI-driven resume analyzer that provides **dual scoring (ATS + Role Fit)**, job-specific keyword insights, and intelligent suggestions to improve your resume.

---

## ✨ Features

- 🎯 **Dual Scoring System**
  - ATS Compatibility Score
  - Role Fit Score

- 👩‍💻 **15+ Job Roles Supported**
  - Software Engineer, Data Scientist, DevOps, UI/UX, Product Manager, etc.

- 📊 **Role-Based Keyword Gap Analysis**
  - Identify missing keywords specific to your target job role

- 🤖 **AI-Powered Suggestions**
  - Smart resume improvement tips using GPT-4o-mini

- ✍️ **AI Resume Section Rewriter**
  - Rewrite sections tailored to your target role

- 📈 **Progress Tracking**
  - Visual score comparison across multiple resume versions

- 🔐 **Secure Authentication**
  - JWT-based login system with saved analysis history

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Recharts |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas + Mongoose            |
| AI         | OpenAI GPT-4o-mini                  |
| Auth       | JWT                                 |
| File Parsing | pdf-parse, mammoth                |
| NLP        | compromise.js                       |

---

## 📁 Project Structure

resume-ai-analyzer/
├── client/
│ └── src/
│ ├── components/
│ ├── pages/
│ ├── context/
│ └── utils/
│
└── server/
├── controllers/
├── routes/
├── models/
├── services/
├── middleware/
└── data/
└── roleProfiles.json

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas / Local MongoDB
- OpenAI API Key
