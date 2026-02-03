import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import CheckIcon from "@mui/icons-material/Check";
import { ThemeContext } from "~/contexts/ThemeContext";

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (mode) => {
    setThemeMode(mode);
    handleClose();
  };

  const modeLabels = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

  const modeIcons = {
    light: <LightModeIcon fontSize="small" />,
    dark: <DarkModeIcon fontSize="small" />,
    system: <SettingsBrightnessIcon fontSize="small" />,
  };

  return (
    <>
      <Tooltip title="Theme">
        <IconButton size="small" onClick={handleClick} sx={{ color: "white" }}>
          {themeMode === "light" && <LightModeIcon />}
          {themeMode === "dark" && <DarkModeIcon />}
          {themeMode === "system" && <SettingsBrightnessIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {["light", "dark", "system"].map((mode) => (
          <MenuItem
            key={mode}
            onClick={() => handleModeSelect(mode)}
            selected={themeMode === mode}
          >
            <ListItemIcon>{modeIcons[mode]}</ListItemIcon>
            <ListItemText>{modeLabels[mode]}</ListItemText>
            {themeMode === mode && (
              <CheckIcon fontSize="small" sx={{ ml: 2 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
