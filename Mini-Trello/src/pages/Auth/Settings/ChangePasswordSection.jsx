import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useTheme } from "@mui/material/styles";

export default function ChangePasswordSection({
  formData,
  handleInputChange,
  handleChangePassword,
  loading,
  error,
  success,
  setError,
  setSuccess,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) {
  const theme = useTheme();

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
      <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
        Change Password
      </Typography>

      <Stack
        spacing={2.5}
        component="form"
        onSubmit={handleChangePassword}
        sx={{ maxWidth: 400 }}
      >
        <TextField
          fullWidth
          type={showCurrentPassword ? "text" : "password"}
          label="Current Password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  sx={{
                    color: theme.palette.primary.main,
                    textTransform: "none",
                    fontSize: "0.75rem",
                    minWidth: "auto",
                    p: 0.5,
                    "&:hover": {
                      bgcolor: `${theme.palette.primary.main}15`,
                    },
                  }}
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: "2px",
              },
            },
          }}
        />

        <Divider />

        <TextField
          fullWidth
          type={showNewPassword ? "text" : "password"}
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  sx={{
                    color: theme.palette.primary.main,
                    textTransform: "none",
                    fontSize: "0.75rem",
                    minWidth: "auto",
                    p: 0.5,
                    "&:hover": {
                      bgcolor: `${theme.palette.primary.main}15`,
                    },
                  }}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: "2px",
              },
            },
          }}
        />

        <TextField
          fullWidth
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm New Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  sx={{
                    color: theme.palette.primary.main,
                    textTransform: "none",
                    fontSize: "0.75rem",
                    minWidth: "auto",
                    p: 0.5,
                    "&:hover": {
                      bgcolor: `${theme.palette.primary.main}15`,
                    },
                  }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: theme.palette.mode === "dark" ? "#444" : "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: "2px",
              },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.3,
            borderRadius: "8px",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "1rem",
            bgcolor: theme.palette.primary.main,
            mt: 2,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: "8px", mt: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ borderRadius: "8px", mt: 3 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}
    </Paper>
  );
}
