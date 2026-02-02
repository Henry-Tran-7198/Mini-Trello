import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
import AppsIcon from "@mui/icons-material/Apps";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

// Local components
import ThemeToggle from "~/components/ThemeToggle";
import Workspaces from "./Menus/Workspaces";
import Recent from "./Menus/Recent";
import Starred from "./Menus/Starred";
import Templates from "./Menus/Templates";
import Profiles from "./Menus/Profiles";
import NotificationIcon from "./NotificationIcon";
import { boardApi } from "~/api/boardApi";

// Assets (Vite SVG = URL)
import TrelloIcon from "~/assets/trello.svg?react";

function AppBar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const handleCreateBoard = async () => {
    if (!boardTitle.trim()) {
      setCreateError("Tên board không được để trống");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      const response = await boardApi.create({
        title: boardTitle.trim(),
        description: boardDescription.trim(),
        type: "public",
      });

      setBoardTitle("");
      setBoardDescription("");
      setOpenCreateDialog(false);

      setSnackbar({
        open: true,
        message: "Tạo board thành công!",
        type: "success",
      });

      setTimeout(() => {
        navigate(`/board/${response.data.board._id}`);
      }, 500);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Lỗi khi tạo board");
      setSnackbar({
        open: true,
        message: "Lỗi khi tạo board",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        gap: 2,
        bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#1565c0",
      }}
    >
      {/* LEFT */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AppsIcon sx={{ color: "white" }} />

        {/* LOGO */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": { opacity: 0.8, transform: "scale(1.05)" },
          }}
        >
          <TrelloIcon style={{ width: 20, height: 20 }} />
          <Typography
            sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}
          >
            Trello
          </Typography>
        </Box>

        {/* MENUS */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
          <Button
            onClick={() => setOpenCreateDialog(true)}
            variant="outlined"
            startIcon={<LibraryAddIcon />}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* SEARCH */}
        <TextField
          size="small"
          label="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "white" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <CloseIcon
                fontSize="small"
                sx={{
                  color: searchValue ? "white" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => setSearchValue("")}
              />
            ),
          }}
          sx={{
            minWidth: 120,
            maxWidth: 180,
            "& label": { color: "white" },
            "& input": { color: "white" },
            "& label.Mui-focused": { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />

        <ThemeToggle />

        <NotificationIcon />

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ color: "white", cursor: "pointer" }} />
        </Tooltip>

        <Profiles />
      </Box>

      {/* Create Board Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => !creating && setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.3rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            color: "white",
            borderRadius: "12px 12px 0 0",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LibraryAddIcon />
          Tạo Board Mới
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {createError && (
            <Fade in={!!createError}>
              <Alert severity="error" sx={{ borderRadius: "8px" }}>
                {createError}
              </Alert>
            </Fade>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Tên board"
            placeholder="VD: Dự án Web, Team Planning"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            disabled={creating}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                transition: "all 0.3s ease",
                "&:hover fieldset": { borderColor: "#2196F3" },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976D2",
                  borderWidth: "2px",
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Mô tả (tùy chọn)"
            placeholder="Mô tả về board của bạn..."
            multiline
            rows={3}
            value={boardDescription}
            onChange={(e) => setBoardDescription(e.target.value)}
            disabled={creating}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                transition: "all 0.3s ease",
                "&:hover fieldset": { borderColor: "#2196F3" },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976D2",
                  borderWidth: "2px",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            disabled={creating}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateBoard}
            variant="contained"
            disabled={creating}
            startIcon={
              creating ? <CircularProgress size={20} /> : <LibraryAddIcon />
            }
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
              background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {creating ? "Đang tạo..." : "Tạo Board"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.type} sx={{ borderRadius: "8px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AppBar;
