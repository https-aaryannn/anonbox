# Firebase Setup for AnonBox

1.  **Create a Firebase Project**
    *   Go to [console.firebase.google.com](https://console.firebase.google.com)
    *   Click "Add project" and follow the steps.

2.  **Enable Firestore**
    *   Go to "Firestore Database" in the sidebar.
    *   Click "Create database".
    *   Start in **Production mode**.
    *   Choose a location close to you.

3.  **Enable Authentication**
    *   Go to "Authentication" in the sidebar.
    *   Click "Get started".
    *   Enable **Email/Password** provider.
    *   **Add a User**: Click "Add user" and create your Initial Admin account (e.g., `admin@anonbox.com`).

4.  **Get Configuration**
    *   Go to Project Settings (gear icon > Project settings).
    *   Scroll to "Your apps" (or click "Add app" > Web </ >).
    *   Register the app (e.g., "AnonBox Web").
    *   Copy the `firebaseConfig` keys.

5.  **Configure Environment Variables**
    *   Rename `.env.example` to `.env` (if not done).
    *   Fill in the values from your Firebase Console.

    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    ...
    ```

6.  **Deploy Security Rules**
    *   Copy the content of `firestore.rules` to your Firestore Rules tab in the console.
    *   Or deploy using CLI if you have it set up: `firebase deploy --only firestore:rules`

7.  **Run the App**
    *   `npm run dev`
