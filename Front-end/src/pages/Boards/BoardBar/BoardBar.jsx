import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import BoltIcon from '@mui/icons-material/Bolt';
import FilterListIcon from '@mui/icons-material/FilterList';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import { capitalizeFirstLetter } from '~/utils/formatters'

const MENU_STYLES = {
    color: 'white',
    bgcolor: 'transparent',
    border: 'none',
    paddingX: '5px',
    borderRadius: '4px',
    '.MuiSvgIcon-root': {
        color: 'white'
    },
    '&:hover': {
        bgcolor: 'primary.50'
    }
}

function BoardBar({ board }) {
    return (
        <Box sx={{
            backgroundColor: 'white',
            width: '100%',
            height: (theme) => theme.trello.boardBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            paddingX: 2,
            overflowX: 'auto',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                    sx={MENU_STYLES}
                    icon={< DashboardIcon />}
                    label={board?.title}
                    clickable
                />
                <Chip
                    sx={MENU_STYLES}
                    icon={< VpnLockIcon />}
                    label={capitalizeFirstLetter(board?.type)}
                    clickable
                />
                <Chip
                    sx={MENU_STYLES}
                    icon={< AddToDriveIcon />}
                    label="Add To Google Drive"
                    clickable
                />
                <Chip
                    sx={MENU_STYLES}
                    icon={< BoltIcon />}
                    label="Automation"
                    clickable
                />
                <Chip
                    sx={MENU_STYLES}
                    icon={< FilterListIcon />}
                    label="Filters"
                    clickable
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    sx={{
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                            borderColor: 'white'
                        }
                    }}
                >
                    Invite
                </Button>

                <AvatarGroup
                    max={5}
                    sx={{
                        gap: '10px',
                        '& .MuiAvatar-root': {
                            width: 34,
                            height: 34,
                            fontSize: 16,
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            '&:first-of-type': { bgcolor: '#a4b0de' }
                        }
                    }}
                >
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                    <Tooltip title="trello">
                        <Avatar alt="Remy Sharp" />
                    </Tooltip>
                </AvatarGroup>
            </Box>
        </Box>
    )
}

export default BoardBar
