import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { StravaProvider } from './context/StravaContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StravaProvider>
      <App />
    </StravaProvider>
  </React.StrictMode>,
)