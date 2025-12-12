# AnonBox - Anonymous Confession Platform

AnonBox is a full-stack capable secure anonymous confession app. It features a public submission portal and a secure admin dashboard powered by AI for sentiment analysis.

## Features

- **Public Interface**: Beautiful, dark-themed confession box with animations.
- **Admin Dashboard**: Secure login to view, delete, and manage confessions.
- **AI Analysis**: Uses Google Gemini 2.5 Flash to analyze confessions for sentiment, risk flags, and auto-summaries.
- **Data Export**: Export confessions to CSV.
- **Responsive**: Mobile-first design using Tailwind CSS.

## Quick Start (Demo Mode)

This project includes a **Mock Database Service** enabled by default so you can run it immediately without setting up Firebase credentials.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Add Gemini API Key**:
    *   Create a `.env` file in the root.
    *   Add: `API_KEY=your_google_gemini_api_key`
    *   (If you don't have one, the app will still work but the "Analyze" button will show a warning).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Admin Login (Mock Credentials)**:
    *   Email: `admin@anonbox.com`
    *   Password: `password123`

## Production Setup (Firebase)

To switch from the Mock DB/Auth to real Firebase:

1.  Create a Firebase Project.
2.  Enable **Firestore Database** and **Authentication** (Email/Password).
3.  Uncomment the Firebase initialization code in `services/dbService.ts` and `services/authService.ts` (you will need to create this based on standard Firebase SDK patterns).
4.  Add your Firebase config to `.env`.

## Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS.
- **AI**: Google GenAI SDK (`gemini-2.5-flash`).
- **State Management**: React Hooks (local state).
- **Backend Stub**: A `server/index.js` file is provided to demonstrate how the Node/Express backend would be structured if decoupling the API from the Next.js/Vite environment.

## Security

- **Rate Limiting**: (Implemented in Backend Stub)
- **Sanitization**: Inputs are rendered safely in React to prevent XSS.
- **Auth**: Admin routes are protected by state checks (and JWT verification in a real deployment).

## Docker

Build and run the container:

```bash
docker build -t anonbox .
docker run -p 8080:80 anonbox
```