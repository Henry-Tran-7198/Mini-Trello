import { Box, Paper, Typography, Button, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ProfileInfoSection({
  user,
  showEmail,
  setShowEmail,
  showPassword,
  setShowPassword,
  maskEmail,
  getCurrentAvatarUrl,
}) {
  const theme = useTheme();

  // Fallback function nếu getCurrentAvatarUrl không được pass
  const getAvatarUrl =
    getCurrentAvatarUrl ||
    (() => {
      if (!user?.avatar) return "";
      const avatarStr = String(user.avatar);
      if (avatarStr.startsWith("http")) return avatarStr;
      if (avatarStr.startsWith("/")) return `http://localhost:8000${avatarStr}`;
      return `http://localhost:8000/storage/${avatarStr}`;
    });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
        Your Profile Information
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2.5,
          mb: 4,
        }}
      >
        {/* Avatar Card */}
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.mode === "dark" ? "#3a3a3a" : "#f8f9fa",
            borderRadius: "8px",
            border: `1px solid ${
              theme.palette.mode === "dark" ? "#555" : "#e0e0e0"
            }`,
            textAlign: "center",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="600"
            sx={{ mb: 2, color: "textSecondary" }}
          >
            Avatar
          </Typography>
          <Avatar
            key={user?.avatar}
            src={getAvatarUrl()}
            alt={user?.username}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
              border: "3px solid",
              borderColor: theme.palette.primary.main,
            }}
          />
        </Box>

        {/* Username Card */}
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.mode === "dark" ? "#3a3a3a" : "#f8f9fa",
            borderRadius: "8px",
            border: `1px solid ${
              theme.palette.mode === "dark" ? "#555" : "#e0e0e0"
            }`,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="600"
            sx={{ mb: 1, color: "textSecondary" }}
          >
            Username
          </Typography>
          <Typography
            variant="body1"
            fontWeight="700"
            sx={{
              fontSize: "1.2rem",
              color: theme.palette.primary.main,
            }}
          >
            {user?.username || "N/A"}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: "block" }}
          >
            Your unique username
          </Typography>
        </Box>

        {/* Email Card */}
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.mode === "dark" ? "#3a3a3a" : "#f8f9fa",
            borderRadius: "8px",
            border: `1px solid ${
              theme.palette.mode === "dark" ? "#555" : "#e0e0e0"
            }`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="600"
              sx={{ color: "textSecondary" }}
            >
              Email (Encrypted)
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => setShowEmail(!showEmail)}
              startIcon={
                showEmail ? (
                  <VisibilityIcon sx={{ fontSize: "1.2rem" }} />
                ) : (
                  <VisibilityOffIcon sx={{ fontSize: "1.2rem" }} />
                )
              }
              sx={{
                color: theme.palette.primary.main,
                textTransform: "none",
                fontSize: "0.8rem",
                minWidth: "auto",
                p: 0.5,
                "&:hover": {
                  bgcolor: `${theme.palette.primary.main}15`,
                },
              }}
            >
              {showEmail ? "Hide" : "Show"}
            </Button>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              wordBreak: "break-all",
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {showEmail ? user?.email : maskEmail(user?.email)}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: "block" }}
          >
            Primary email address
          </Typography>
        </Box>

        {/* Password Card */}
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.mode === "dark" ? "#3a3a3a" : "#f8f9fa",
            borderRadius: "8px",
            border: `1px solid ${
              theme.palette.mode === "dark" ? "#555" : "#e0e0e0"
            }`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="600"
              sx={{ color: "textSecondary" }}
            >
              Password (Encrypted)
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => setShowPassword(!showPassword)}
              startIcon={
                showPassword ? (
                  <VisibilityIcon sx={{ fontSize: "1.2rem" }} />
                ) : (
                  <VisibilityOffIcon sx={{ fontSize: "1.2rem" }} />
                )
              }
              sx={{
                color: theme.palette.primary.main,
                textTransform: "none",
                fontSize: "0.8rem",
                minWidth: "auto",
                p: 0.5,
                "&:hover": {
                  bgcolor: `${theme.palette.primary.main}15`,
                },
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              letterSpacing: showPassword ? "0px" : "2px",
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: showPassword ? "0.85rem" : "1.5rem",
            }}
          >
            {showPassword ? "●●●●●●●●●●●●●●●●" : "••••••••••"}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: "block" }}
          >
            Securely encrypted
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
