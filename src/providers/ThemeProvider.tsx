import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import ThemeContext from '~/contexts/ThemeContext'

type Props = { children: ReactNode }

const ThemeProvider = (props: Props) => {
  const { children } = props

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#ff4081',
      },
      // secondary: {
      //   main: '#19857b',
      // },
      // error: {
      //   main: colors.red.A400,
      // },
    },
  })

  const value = { theme }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
