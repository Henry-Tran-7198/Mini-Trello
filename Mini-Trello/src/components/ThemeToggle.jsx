import { useContext } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { ThemeContext } from '~/contexts/ThemeContext'

export default function ThemeToggle() {
  const { mode, toggleTheme } = useContext(ThemeContext)

  return (
    <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
      <IconButton
        size="small"
        onClick={toggleTheme}
        sx={{ color: 'white' }}
      >
        {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  )
}
