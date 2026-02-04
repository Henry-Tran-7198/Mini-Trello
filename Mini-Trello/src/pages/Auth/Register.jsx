import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Container,
  InputAdornment,
  CircularProgress,
  Avatar,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { authApi } from "~/api/authApi";
import TrelloIcon from "~/assets/trello.svg?react";

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("username", form.username);
      formData.append("password", form.password);
      formData.append("password_confirmation", form.password);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await authApi.register(formData);

      // Save email to localStorage so it auto-fills in login
      localStorage.setItem("rememberedLogin", form.email);

      // Navigate to login with success
      navigate("/login");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        "Register failed";
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "12px",
            background: theme.palette.mode === "dark" ? "#2d2d2d" : "#ffffff",
            border: `1px solid ${theme.palette.mode === "dark" ? "#444" : "#e0e0e0"}`,
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <TrelloIcon style={{ width: 40, height: 40 }} />
            </Box>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
              Sign up for Trello
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create an account to get started organizing
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px" }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              name="email"
              label="Email address"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#1565c0", mr: 1 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1565c0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1565c0",
                    borderWidth: "2px",
                  },
                },
              }}
            />
            <TextField
              name="username"
              label="Username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#1565c0", mr: 1 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1565c0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1565c0",
                    borderWidth: "2px",
                  },
                },
              }}
            />
            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#1565c0", mr: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{
                        color: "#1565c0",
                        "&:hover": {
                          bgcolor: "rgba(21, 101, 192, 0.1)",
                        },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor:
                      theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1565c0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1565c0",
                    borderWidth: "2px",
                  },
                },
              }}
            />

            {/* Avatar Upload */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 2 }}>
                Profile Picture (Optional)
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                id="avatar-input"
                disabled={loading}
              />
              <label htmlFor="avatar-input" style={{ width: "100%" }}>
                <Button
                  component="span"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#1565c0",
                    color: "#1565c0",
                    fontWeight: 600,
                    textTransform: "none",
                    py: 1.3,
                    "&:hover": {
                      bgcolor: "#1565c020",
                      borderColor: "#1565c0",
                    },
                  }}
                >
                  {avatar ? "Change Avatar" : "Choose Avatar"}
                </Button>
              </label>
              {avatarPreview && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Avatar
                    src={avatarPreview}
                    alt="Avatar preview"
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      border: "2px solid #1565c0",
                    }}
                  />
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3.5,
                py: 1.3,
                borderRadius: "8px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                bgcolor: "#1565c0",
                boxShadow: "0 2px 8px rgba(21, 101, 192, 0.2)",
                "&:hover": {
                  bgcolor: "#0d47a1",
                  boxShadow: "0 4px 12px rgba(21, 101, 192, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <Box sx={{ my: 3, position: "relative" }}>
            <Box
              sx={{
                borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#444" : "#e0e0e0"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  px: 2,
                  bgcolor:
                    theme.palette.mode === "dark" ? "#2d2d2d" : "#ffffff",
                }}
              >
                Already have an account?
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Button
            fullWidth
            variant="outlined"
            sx={{
              py: 1.3,
              borderRadius: "8px",
              borderColor: "#1565c0",
              color: "#1565c0",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#1565c020",
                borderColor: "#1565c0",
              },
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Log in to your account
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
