import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Fade,
  CircularProgress,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

export default function CardDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
}) {
  const [cardData, setCardData] = useState({
    title: "",
    description: "",
    cover: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setCardData({
        title: initialData.title || "",
        description: initialData.description || "",
        cover: initialData.cover || "",
      });
    } else {
      setCardData({
        title: "",
        description: "",
        cover: "",
      });
    }
    setError("");
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!cardData.title.trim()) {
      setError("Tiêu đề card không được để trống");
      return;
    }

    try {
      setError("");
      await onSubmit(cardData);
      setCardData({ title: "", description: "", cover: "" });
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    }
  };

  const handleClose = () => {
    setCardData({ title: "", description: "", cover: "" });
    setError("");
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          background: isEditing
            ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
            : "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
          color: "white",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {isEditing ? <EditIcon /> : <AddIcon />}
        {title}
      </DialogTitle>
      <DialogContent
        sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                borderRadius: "8px",
                animation: "slideIn 0.3s ease-out",
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}
        <Box>
          <TextField
            autoFocus
            fullWidth
            label="Tiêu đề card"
            placeholder="VD: Thiết kế giao diện"
            value={cardData.title}
            onChange={(e) =>
              setCardData({ ...cardData, title: e.target.value })
            }
            disabled={loading}
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
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box>
          <TextField
            fullWidth
            label="Mô tả"
            multiline
            rows={3}
            placeholder="Thêm mô tả chi tiết cho card..."
            value={cardData.description}
            onChange={(e) =>
              setCardData({ ...cardData, description: e.target.value })
            }
            disabled={loading}
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
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box>
          <TextField
            fullWidth
            label="URL ảnh bìa"
            value={cardData.cover}
            onChange={(e) =>
              setCardData({ ...cardData, cover: e.target.value })
            }
            disabled={loading}
            placeholder="https://example.com/image.jpg"
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
          {cardData.cover && (
            <Fade in={!!cardData.cover}>
              <Box
                component="img"
                src={cardData.cover}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                sx={{
                  mt: 2,
                  maxHeight: 150,
                  width: "100%",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "1px solid #e0e0e0",
                }}
              />
            </Fade>
          )}
        </Box>
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
          startIcon={
            loading ? (
              <CircularProgress size={20} />
            ) : isEditing ? (
              <EditIcon />
            ) : (
              <AddIcon />
            )
          }
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1rem",
            background: isEditing
              ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
              : "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
            "&:hover": {
              background: isEditing
                ? "linear-gradient(135deg, #FFB74D 0%, #FB8C00 100%)"
                : "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)",
            },
            transition: "all 0.3s ease",
          }}
        >
          {loading
            ? "Đang xử lý..."
            : isEditing
              ? "Cập nhật Card"
              : "Thêm Card"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
