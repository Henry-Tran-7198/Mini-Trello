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
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { authApi } from "~/api/authApi";
import TrelloIcon from "~/assets/trello.svg?react";

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");

  // Check for session expired message on mount and load saved login
  useEffect(() => {
    const msg = sessionStorage.getItem("sessionExpiredMessage");
    if (msg) {
      setSessionExpiredMsg(msg);
      sessionStorage.removeItem("sessionExpiredMessage");
    }

    // Load saved login from localStorage
    const savedLogin = localStorage.getItem("rememberedLogin");
    if (savedLogin) {
      setLogin(savedLogin);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login({ login, password });
      // Use sessionStorage instead of localStorage
      // This allows multiple accounts in different tabs
      sessionStorage.setItem("token", res.data.token);

      // Save login if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedLogin", login);
      } else {
        localStorage.removeItem("rememberedLogin");
      }

      navigate("/");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);

    // If unchecking, clear saved login
    if (!isChecked) {
      localStorage.removeItem("rememberedLogin");
      setLogin("");
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
              Log in to Trello
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enter your credentials to access your boards
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px" }}>
              {error}
            </Alert>
          )}

          {sessionExpiredMsg && (
            <Alert severity="warning" sx={{ mb: 2.5, borderRadius: "8px" }}>
              {sessionExpiredMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email or username"
              fullWidth
              margin="normal"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
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
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={loading}
                  sx={{
                    color: "#1565c0",
                    "&.Mui-checked": {
                      color: "#1565c0",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "textSecondary" }}>
                  Remember me
                </Typography>
              }
              sx={{ my: 1.5 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
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
                display: "flex",
                gap: 1,
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Log in"
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
                Don't have an account?
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
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            Sign up for an account
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
