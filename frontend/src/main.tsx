import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT = import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID

if (!GOOGLE_CLIENT) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
