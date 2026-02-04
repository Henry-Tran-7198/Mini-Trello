import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTheme } from "@mui/material/styles";
import { useRef } from "react";

export default function AvatarUploadSection({
  user,
  getAvatarUrl,
  getCurrentAvatarUrl,
  avatarPreview,
  selectedFile,
  loading,
  error,
  success,
  setError,
  setSuccess,
  handleAvatarChange,
  handleSaveAvatar,
  setAvatarPreview,
  setSelectedFile,
}) {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelUpload = () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    setError("");
    setSuccess("");
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: "12px",
        p: 4,
        background: theme.palette.mode === "dark" ? "#2d2d2d" : "#ffffff",
        border: `1px solid ${
          theme.palette.mode === "dark" ? "#444" : "#e0e0e0"
        }`,
      }}
    >
      <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
        Profile Picture
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          mb: 4,
        }}
      >
        <Avatar
          key={user?.avatar}
          src={getCurrentAvatarUrl()}
          alt={user?.username}
          sx={{
            width: 140,
            height: 140,
            boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
            border: "3px solid",
            borderColor: theme.palette.primary.main,
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
        />

        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleAvatarClick}
          disabled={loading && !avatarPreview}
          sx={{
            py: 1,
            px: 3,
            borderRadius: "8px",
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: `${theme.palette.primary.main}15`,
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          {avatarPreview ? "Select Another Image" : "Upload New Picture"}
        </Button>

        <Typography variant="caption" color="textSecondary" align="center">
          JPG, PNG or WebP. Max 2MB. Min 200x200px recommended.
        </Typography>

        {avatarPreview && (
          <>
            <Divider sx={{ width: "100%" }} />
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="subtitle2"
                fontWeight="600"
                sx={{ mb: 3, textAlign: "center" }}
              >
                Compare & Confirm
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 3,
                  mb: 3,
                  alignItems: "center",
                }}
              >
                {/* Current Avatar */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Current
                  </Typography>
                  <Avatar
                    key={user?.avatar}
                    src={getCurrentAvatarUrl()}
                    alt={user?.username}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
                      border: "3px solid",
                      borderColor: theme.palette.primary.main,
                    }}
                  />
                </Box>

                {/* New Avatar Preview */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mb: 1, display: "block", fontWeight: 600 }}
                  >
                    New
                  </Typography>
                  <Avatar
                    src={avatarPreview}
                    alt="Preview"
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      boxShadow: "0 4px 12px rgba(21, 101, 192, 0.3)",
                      border: "3px solid",
                      borderColor: "#4caf50",
                      opacity: 0.9,
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={handleSaveAvatar}
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: "8px",
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Saving...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelUpload}
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    px: 4,
                    borderRadius: "8px",
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#f44336",
                    color: "#f44336",
                    "&:hover": {
                      bgcolor: "rgba(244, 67, 54, 0.1)",
                      borderColor: "#f44336",
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: "8px", mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ borderRadius: "8px" }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}
    </Paper>
  );
}
