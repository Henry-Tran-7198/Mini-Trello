import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import LogoutButton from '../../AuthForm/LogoutButton';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../api/authService';


function Profiles() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loadingAvatar, setLoadingAvatar] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Fetch current user avatar when component mounts
    useEffect(() => {
        const fetchUserAvatar = async () => {
            try {
                const response = await authService.getCurrentUser();
                console.log("Full API response:", response);

                // Try different common paths to find avatar
                const avatarPath =
                    response?.data?.avatar ||
                    response?.data?.data?.avatar ||
                    response?.avatar;

                if (avatarPath) {
                    // If backend returns only path (e.g. "avatars/xxx.jpg"), add base URL
                    const fullUrl = avatarPath.startsWith('http')
                        ? avatarPath
                        : `http://localhost:8000/storage/${avatarPath}`;

                    console.log("Avatar full URL:", fullUrl);
                    setAvatarPreview(fullUrl);
                } else {
                    console.warn("No avatar found in API response");
                }
            } catch (err) {
                console.error("Failed to load avatar:", err);
                setError('Failed to load avatar');
            } finally {
                setLoadingAvatar(false);
            }
        };

        fetchUserAvatar();
    }, []);

    return (
        <Box>
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ padding: 0 }}
                    aria-controls={open ? 'basic-menu-profiles' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    {(
                        <Avatar
                            sx={{ width: 34, height: 34 }}
                            alt="User Avatar"
                            src={avatarPreview || '/avatar/default.png'}
                        />
                    )}
                </IconButton>
            </Tooltip>

            <Menu
                id="basic-menu-profiles"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button-profiles',
                }}
            >
                <MenuItem onClick={() => navigate('/profile')}>
                    <Avatar sx={{ width: 28, height: 28, mr: 2 }} /> Profile
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Avatar sx={{ width: 28, height: 28, mr: 2 }} /> My account
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    Add another account
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <LogoutButton />
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default Profiles;