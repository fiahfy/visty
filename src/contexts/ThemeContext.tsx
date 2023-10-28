import { CssBaseline, Theme } from '@mui/material'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles'
import { ReactNode, createContext } from 'react'

export const ThemeContext = createContext<
  | {
      theme: Theme
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const ThemeProvider = (props: Props) => {
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
