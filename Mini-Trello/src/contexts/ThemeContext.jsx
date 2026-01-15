import { createContext, useState, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'

export const ThemeContext = createContext()

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'

export function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState('light')

  const theme = useMemo(() => {
    const isDark = mode === 'dark'
    return createTheme({
      palette: {
        mode: mode,
        primary: {
          main: isDark ? '#90caf9' : '#1976d2'
        },
        background: {
          default: isDark ? '#121212' : '#ffffff'
        },
        text: {
          primary: isDark ? '#ffffff' : '#000000'
        }
      },
      trello: {
        appBarHeight: APP_BAR_HEIGHT,
        boardBarHeight: BOARD_BAR_HEIGHT,
        boardContentHeight: BOARD_CONTENT_HEIGHT,
        columnHeaderHeight: COLUMN_HEADER_HEIGHT,
        columnFooterHeight: COLUMN_FOOTER_HEIGHT,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              '*::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '*::-webkit-scrollbar-thumb': {
                backgroundColor: '#dcdde1',
                borderRadius: '8px',
              },
              '*::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'white',
              },
              '*::-webkit-scrollbar-track': {
                m: 2,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderWidth: '0.5px',
              '&:hover': { borderWidth: '0.5px' },
            },
          },
        },
      },
    })
  }, [mode])

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
