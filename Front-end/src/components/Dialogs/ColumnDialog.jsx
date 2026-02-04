import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function ColumnDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [columnTitle, setColumnTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!columnTitle.trim()) {
      setError("Tên column không được để trống");
      return;
    }

    try {
      setError("");
      await onSubmit(columnTitle.trim());
      setColumnTitle("");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    }
  };

  const handleClose = () => {
    setColumnTitle("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
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
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: "8px",
                animation: "slideIn 0.3s ease-out",
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Tên column"
          placeholder="VD: To Do, In Progress, Done"
          value={columnTitle}
          onChange={(e) => setColumnTitle(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => e.key === "Enter" && !loading && handleSubmit()}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "&:hover": {
                "& fieldset": {
                  borderColor: "#2196F3",
                },
              },
              "&.Mui-focused": {
                "& fieldset": {
                  borderColor: "#1976D2",
                  borderWidth: "2px",
                },
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
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
          {loading ? "Đang thêm..." : "Thêm Column"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
