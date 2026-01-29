import { useState, useEffect } from 'react';
import { authService } from '../../api/authService'; // Assume this has updateProfile & getCurrentUser methods

// MUI imports
import {
    Box,
    Drawer,
    List,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Visibility,
    CreditCard,
    Settings,
    Dashboard,
    People,
    Description,
    PhotoCamera,
} from '@mui/icons-material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        avatar: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const navigate = useNavigate();

    // Load current user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser(); // Assume this API returns { username, email, avatar, bio? }
                console.log("Dữ liệu user nhận được từ API:", user);
                setForm({
                    username: user?.data?.data?.username || '',
                    email: user?.data?.data?.email || '',
                    password: user?.data?.data?.password || '',
                });

                if (user?.data?.data?.avatar) {
                    setAvatarPreview(user?.data?.data?.avatar); // full URL like http://localhost:8000/storage/avatars/xxx.jpg
                }
            } catch (err) {
                setError('Failed to load profile data');
            } finally {
                setPageLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Bắt đầu update profile...");
        setLoading(true);

        try {
            // Create FormData RIGHT HERE
            const formData = new FormData();
            formData.append('username', form.username || '');
            formData.append('email', form.email || '');
            // Chỉ gửi password nếu người dùng nhập mới (không rỗng và không phải chuỗi hash)
            if (form.password && form.password.length > 0 && !form.password.startsWith('$2y$')) {
                formData.append('password', form.password || '');
            };
            if (avatar) {
                console.log("Avatar file selected:", avatar.name, avatar.size, avatar.type);
                formData.append('avatar', avatar);
                console.log("Avatar appended successfully");
            } else {
                console.log("No avatar file selected");
            }

            console.log("FormData trước khi gửi:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            console.log("Gọi API với formData:", form); // still log form if you want
            const response = await authService.updateProfile(formData);
            console.log("Response từ backend:", response.data);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            console.error("Lỗi update:", err);
            setError(err.response?.data?.message || 'Update failed...');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2') }}>
            {/* LEFT SIDEBAR */}
            <Drawer
                variant="permanent"
                sx={{
                    width: 280,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                <Box sx={{ height: '100%', overflow: 'auto', pt: 4, px: 2 }}>
                    <List>
                        <ListSubheader sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Profile settings
                        </ListSubheader>
                        <ListItemButton selected>
                            <ListItemIcon><Visibility /></ListItemIcon>
                            <ListItemText primary="Profile & Display" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><Dashboard /></ListItemIcon>
                            <ListItemText primary="Action" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><CreditCard /></ListItemIcon>
                            <ListItemText primary="Card" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><Settings /></ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <List>
                        <ListSubheader sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Workspace
                        </ListSubheader>
                        <ListItemButton>
                            <ListItemIcon><People /></ListItemIcon>
                            <ListItemText primary={`Workspace of ${form.username}`} />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><Dashboard /></ListItemIcon>
                            <ListItemText primary="Board" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><People /></ListItemIcon>
                            <ListItemText primary="Members" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><Settings /></ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                        <ListItemButton onClick={() => navigate('/board')}>
                            <ListItemIcon><KeyboardBackspaceIcon /></ListItemIcon>
                            <ListItemText primary="Back to Board" />
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>

            {/* MAIN CONTENT */}
            <Box component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4 },
                    pt: 6,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Top row: Avatar (left) + Title (right) */}
                <Box sx={{
                    width: '100%',
                    maxWidth: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 4,
                    mb: 6,
                }}>
                    {/* Avatar + hidden Change button */}
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={avatarPreview || '/avatar/default.png'}
                            sx={{
                                width: 160,
                                height: 160,
                                borderRadius: 0,
                                boxShadow: 3,
                            }}
                        />

                        {/* Nút Change Avatar – ẩn, hiện khi hover */}
                        <input
                            accept="image/*"
                            id="avatar-upload"
                            type="file"
                            hidden
                            onChange={handleAvatarChange}
                        />
                        <label htmlFor="avatar-upload">
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<PhotoCamera />}
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    bottom: 0, // dính sát đáy avatar
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 160, // tự động theo nội dung
                                    height: 60, // cao đúng 60px
                                    bgcolor: 'rgba(0, 0, 0, 0.6)', // nền đen mờ 60%
                                    color: 'white',
                                    fontSize: '0.75rem',          // chữ nhỏ hơn (0.75rem ≈ 12px)
                                    fontWeight: 500,
                                    textTransform: 'none',        // không in hoa toàn bộ
                                    opacity: 0,
                                    transition: 'opacity 0.3s, transform 0.2s',
                                    '&:hover': {
                                        opacity: 1,
                                        transform: 'translateX(-50%) scale(1.05)', // phóng to nhẹ khi hover
                                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                                    },
                                    boxShadow: '0 -2px 8px rgba(0,0,0,0.3)', // bóng nhẹ phía trên
                                }}
                            >
                                Change Avatar
                            </Button>
                        </label>
                    </Box>

                    {/* Tiêu đề Personal profile – nằm bên phải */}
                    <Typography variant="h2" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        Personal profile
                    </Typography>


                </Box>

                <Box sx={{
                    maxWidth: 570,
                    bgcolor: '#2c3e50',
                    gap: 4,
                    mt: '40px',
                    mb: '40px',
                    p: 4,
                    borderRadius: 3,
                    border: '2px solid #2c3e50',
                }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        This is your Atlassian account. Edit your personal information and display settings through your Atlassian profile.
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        To learn more, please refer to the Terms of Service or the Privacy Policy.
                    </Typography>
                </Box>

                {/* Phần form bên dưới – giữ nguyên */}
                <Box sx={{
                    maxWidth: 800,
                }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            value={form.username}
                            variant="filled"
                            onChange={handleChange}
                            margin="normal"
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            variant="filled"
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            variant="filled"
                            onChange={handleChange}
                            autoComplete="new-password"
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
        </Box>
    );
}

export default Profile;