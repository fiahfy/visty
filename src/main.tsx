import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import { StoreProvider } from '~/contexts/StoreContext'
import { ThemeProvider } from '~/contexts/ThemeContext'
import { TrafficLightsProvider } from '~/contexts/TrafficLightsContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightsProvider>
          <App />
        </TrafficLightsProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>,
)
