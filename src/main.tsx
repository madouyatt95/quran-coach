import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import App from './App.tsx'
import {initializeNativeLayout} from './lib/nativeLayout'

void initializeNativeLayout()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
