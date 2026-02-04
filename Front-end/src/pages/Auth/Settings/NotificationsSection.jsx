import {
  Paper,
  Typography,
  Stack,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTheme } from "@mui/material/styles";

export default function NotificationsSection({
  notificationSettings,
  handleNotificationChange,
  success,
  setSuccess,
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
      <Typography variant="h5" fontWeight="700" sx={{ mb: 4 }}>
        <NotificationsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Notification Preferences
      </Typography>

      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2.5,
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
            }}
          >
            <Box>
              <Typography fontWeight="600" sx={{ mb: 0.5 }}>
                Board Updates
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Get notified about changes to boards you're watching (member
                added, board renamed, etc.)
              </Typography>
            </Box>
            <Switch
              checked={notificationSettings.boardUpdates}
              onChange={() => handleNotificationChange("boardUpdates")}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
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
            }}
          >
            <Box>
              <Typography fontWeight="600" sx={{ mb: 0.5 }}>
                Card Assignments
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Notify me when I'm assigned to a card
              </Typography>
            </Box>
            <Switch
              checked={notificationSettings.cardAssignment}
              onChange={() => handleNotificationChange("cardAssignment")}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
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
            }}
          >
            <Box>
              <Typography fontWeight="600" sx={{ mb: 0.5 }}>
                Card Comments
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Notify me when comments are added to cards
              </Typography>
            </Box>
            <Switch
              checked={notificationSettings.cardComments}
              onChange={() => handleNotificationChange("cardComments")}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
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
            }}
          >
            <Box>
              <Typography fontWeight="600" sx={{ mb: 0.5 }}>
                Card Moves
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Get notified when cards are moved between columns
              </Typography>
            </Box>
            <Switch
              checked={notificationSettings.cardMove}
              onChange={() => handleNotificationChange("cardMove")}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.5,
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
            }}
          >
            <Box>
              <Typography fontWeight="600" sx={{ mb: 0.5 }}>
                Card Attachments
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Get notified when files are attached to cards
              </Typography>
            </Box>
            <Switch
              checked={notificationSettings.cardAttachment}
              onChange={() => handleNotificationChange("cardAttachment")}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2.5,
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
            }}
          >
            <Box>
              <Typography fontWeight="600" sx={{ mb: 0.5 }}>
                Email Notifications
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Send notifications to my email address
              </Typography>
            </Box>
            <Switch
              checked={notificationSettings.emailNotifications}
              onChange={() => handleNotificationChange("emailNotifications")}
            />
          </Box>
        </Box>
      </Stack>

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
