import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import routes from './routes'
import './main.css'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

const GOOGLE_CLIENT = import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID

if (!GOOGLE_CLIENT) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT}>
      <Provider store={store}>
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          newestOnTop 
          closeOnClick 
          pauseOnHover 
        />
        <RouterProvider router={routes} />
      </Provider>
    </GoogleOAuthProvider>
)
