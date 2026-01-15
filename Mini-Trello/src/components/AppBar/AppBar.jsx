import { useState } from 'react'
import { useTheme } from '@mui/material/styles'

// MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

// Icons
import AppsIcon from '@mui/icons-material/Apps'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

// Local components
import ThemeToggle from '~/components/ThemeToggle'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Profiles from './Menus/Profiles'

// Assets (Vite SVG = URL)
import TrelloIcon from '~/assets/trello.svg?react'

function AppBar() {
  const theme = useTheme()
  const [searchValue, setSearchValue] = useState('')

  return (
    <Box
      sx={{
        width: '100%',
        height: theme.trello.appBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        gap: 2,
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#1565c0'
      }}
    >
      {/* LEFT */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AppsIcon sx={{ color: 'white' }} />

        {/* LOGO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrelloIcon style={{ width: 20, height: 20 }} />
          <Typography
            sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}
          >
            Trello
          </Typography>
        </Box>

        {/* MENUS */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
          <Button
            variant="outlined"
            startIcon={<LibraryAddIcon />}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': { borderColor: 'white' }
            }}
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* SEARCH */}
        <TextField
          size="small"
          label="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <CloseIcon
                fontSize="small"
                sx={{
                  color: searchValue ? 'white' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setSearchValue('')}
              />
            )
          }}
          sx={{
            minWidth: 120,
            maxWidth: 180,
            '& label': { color: 'white' },
            '& input': { color: 'white' },
            '& label.Mui-focused': { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'white' },
              '&:hover fieldset': { borderColor: 'white' },
              '&.Mui-focused fieldset': { borderColor: 'white' }
            }
          }}
        />

        <ThemeToggle />

        <Tooltip title="Notifications">
          <Badge color="warning" variant="dot">
            <NotificationsNoneIcon sx={{ color: 'white', cursor: 'pointer' }} />
          </Badge>
        </Tooltip>

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ color: 'white', cursor: 'pointer' }} />
        </Tooltip>

        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar
