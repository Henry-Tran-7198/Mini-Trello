import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Button,
  Typography,
  AppBar as MuiAppBar,
  Toolbar,
  Paper,
  Avatar,
  Alert,
  TextField,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "~/contexts/AuthContext";
import { authApi } from "~/api/authApi";

// Import sections
import ProfileInfoSection from "./Settings/ProfileInfoSection";
import AvatarUploadSection from "./Settings/AvatarUploadSection";
import ChangePasswordSection from "./Settings/ChangePasswordSection";
import NotificationsSection from "./Settings/NotificationsSection";
import DangerZoneSection from "./Settings/DangerZoneSection";

function Settings() {
  const theme = useTheme();
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    boardUpdates: true,
    cardAssignment: true,
    cardComments: true,
    cardMove: true,
    cardAttachment: true,
    emailNotifications: true,
  });

  // Show/Hide sensitive info
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getCurrentAvatarUrl = () => {
    if (!user?.avatar) return "";
    const avatarStr = String(user.avatar);
    if (avatarStr.startsWith("http")) return avatarStr;
    if (avatarStr.startsWith("/")) return `http://localhost:8000${avatarStr}`;
    return `http://localhost:8000/storage/${avatarStr}`;
  };

  const getAvatarUrl = () => {
    if (avatarPreview) {
      return avatarPreview;
    }
    return getCurrentAvatarUrl();
  };

  const maskEmail = (email) => {
    if (!email) return "N/A";
    const [username, domain] = email.split("@");

    if (!domain) return email;

    // Mask username: first 2 chars + asterisks + last 2 chars
    const maskedUsername =
      username.slice(0, 2) +
      "*".repeat(Math.max(0, username.length - 4)) +
      username.slice(-2);

    // Mask domain: first 2 chars of domain name + rest
    const [domainName, ...domainExt] = domain.split(".");
    const maskedDomain =
      "*".repeat(Math.min(2, domainName.length)) +
      domainName.slice(2) +
      (domainExt.length > 0 ? "." + domainExt.join(".") : "");

    return maskedUsername + "@" + maskedDomain;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Load notification preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await authApi.getNotificationPreferences();
        if (response.data?.notification_preferences) {
          setNotificationSettings(response.data.notification_preferences);
        }
      } catch (err) {
        console.warn("Failed to load notification preferences:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      setSuccess("Image selected. Click 'Confirm' to upload.");
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      setError("No file selected");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const response = await authApi.uploadAvatar(selectedFile);
      // Nếu API response thành công (không throw error), thì reload page
      // Avatar đã được lưu trên server
      setAvatarPreview(null);
      setSelectedFile(null);
      setSuccess("Avatar updated successfully! Reloading...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload avatar");
      setAvatarPreview(null);
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      setSuccess("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (setting) => {
    const updatedSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    };
    setNotificationSettings(updatedSettings);

    try {
      await authApi.updateNotificationPreferences(updatedSettings);
      setSuccess("Notification setting updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update notification setting",
      );
      // Revert the change on error
      setNotificationSettings(notificationSettings);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to logout");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #f0f4f8 0%, #e8f0f7 50%, #f5f6fa 100%)",
      }}
    >
      <MuiAppBar
        position="static"
        elevation={3}
        sx={{ background: theme.palette.primary.main }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            Back to Boards
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="h6" fontWeight="700">
            Account Settings
          </Typography>
        </Toolbar>
      </MuiAppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 3 }}>
          <Box>
            <Paper
              elevation={2}
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                background:
                  theme.palette.mode === "dark" ? "#2d2d2d" : "#ffffff",
                border: `1px solid ${theme.palette.mode === "dark" ? "#444" : "#e0e0e0"}`,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background: theme.palette.primary.main,
                  color: "white",
                  textAlign: "center",
                }}
              >
                <Avatar
                  key={user?.avatar}
                  src={getCurrentAvatarUrl()}
                  alt={user?.username}
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    border: "3px solid white",
                  }}
                />
                <Typography variant="h6" fontWeight="700">
                  {user?.username}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {maskEmail(user?.email)}
                </Typography>
              </Box>
              <Box sx={{ py: 2 }}>
                {[
                  { id: "profile", label: "Profile", icon: "👤" },
                  { id: "password", label: "Password", icon: "🔐" },
                  { id: "notifications", label: "Notifications", icon: "🔔" },
                ].map((item) => (
                  <Button
                    key={item.id}
                    fullWidth
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      textAlign: "left",
                      justifyContent: "flex-start",
                      color:
                        activeTab === item.id
                          ? theme.palette.primary.main
                          : "inherit",
                      bgcolor:
                        activeTab === item.id
                          ? theme.palette.mode === "dark"
                            ? "#444"
                            : "#f5f5f5"
                          : "transparent",
                      borderLeft:
                        activeTab === item.id
                          ? `4px solid ${theme.palette.primary.main}`
                          : "4px solid transparent",
                      borderRadius: 0,
                      fontWeight: activeTab === item.id ? 600 : 500,
                      fontSize: "0.95rem",
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#383838" : "#fafafa",
                      },
                    }}
                  >
                    <span style={{ marginRight: 8 }}>{item.icon}</span>
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Box>

          <Box>
            {activeTab === "profile" && (
              <>
                <ProfileInfoSection
                  user={user}
                  showEmail={showEmail}
                  setShowEmail={setShowEmail}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  maskEmail={maskEmail}
                  getCurrentAvatarUrl={getCurrentAvatarUrl}
                />
                <AvatarUploadSection
                  user={user}
                  getAvatarUrl={getAvatarUrl}
                  getCurrentAvatarUrl={getCurrentAvatarUrl}
                  avatarPreview={avatarPreview}
                  selectedFile={selectedFile}
                  loading={loading}
                  error={error}
                  success={success}
                  setError={setError}
                  setSuccess={setSuccess}
                  handleAvatarChange={handleAvatarChange}
                  handleSaveAvatar={handleSaveAvatar}
                  setAvatarPreview={setAvatarPreview}
                  setSelectedFile={setSelectedFile}
                />
              </>
            )}

            {activeTab === "password" && (
              <ChangePasswordSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleChangePassword={handleChangePassword}
                loading={loading}
                error={error}
                success={success}
                setError={setError}
                setSuccess={setSuccess}
                showCurrentPassword={showCurrentPassword}
                setShowCurrentPassword={setShowCurrentPassword}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsSection
                notificationSettings={notificationSettings}
                handleNotificationChange={handleNotificationChange}
                success={success}
                setSuccess={setSuccess}
              />
            )}

            <DangerZoneSection handleLogout={handleLogout} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Settings;
