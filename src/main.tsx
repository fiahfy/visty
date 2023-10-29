import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import { StoreProvider } from '~/contexts/StoreContext'
import { ThemeProvider } from '~/contexts/ThemeContext'
import { TrafficLightProvider } from '~/contexts/TrafficLightContext'
import { VideoProvider } from '~/contexts/VideoContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightProvider>
          <VideoProvider>
            <App />
          </VideoProvider>
        </TrafficLightProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>,
)
