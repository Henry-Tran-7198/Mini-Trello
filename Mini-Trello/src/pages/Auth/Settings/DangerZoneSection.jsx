import { Paper, Typography, Button, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";

export default function DangerZoneSection({ handleLogout }) {
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
        mt: 3,
        borderColor: "#f44336",
        borderWidth: "2px",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="700"
        sx={{ mb: 2, color: "#f44336" }}
      >
        Danger Zone
      </Typography>

      <Typography color="textSecondary" sx={{ mb: 3 }}>
        Log out from this device
      </Typography>

      <Button
        variant="contained"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          borderRadius: "8px",
          fontWeight: 600,
          textTransform: "none",
          fontSize: "1rem",
          py: 1.2,
          bgcolor: "#f44336",
          "&:hover": {
            bgcolor: "#d32f2f",
          },
        }}
      >
        Logout
      </Button>
    </Paper>
  );
}
