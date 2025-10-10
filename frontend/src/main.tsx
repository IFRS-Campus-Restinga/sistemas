import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import routes from './routes'
import './main.css'
import { Provider } from 'react-redux'
import { store } from './store/store'

const GOOGLE_CLIENT = import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID

if (!GOOGLE_CLIENT) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT}>
      <Provider store={store}>
        <RouterProvider router={routes} />
      </Provider>
    </GoogleOAuthProvider>
)
