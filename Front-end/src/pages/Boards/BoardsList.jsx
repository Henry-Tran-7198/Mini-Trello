import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Fade,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { boardApi } from "~/api/boardApi";
import { AuthContext } from "~/contexts/AuthContext";
import AppBar from "~/components/AppBar/AppBar";

export default function BoardsList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Board Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  // Fetch boards
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const response = await boardApi.getBoards();
        setBoards(response.data.boards || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching boards:", err);
        setError(err.response?.data?.message || "Lỗi khi tải boards");
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // Handle create board
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

      setBoards([...boards, response.data.board]);
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

  // Handle delete board
  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá board này?")) return;

    try {
      await boardApi.delete(boardId);
      setBoards(boards.filter((b) => b._id !== boardId));
      setSnackbar({
        open: true,
        message: "Xoá board thành công!",
        type: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi khi xoá board",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      {/* App Bar */}
      <AppBar />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: theme.palette.primary.main }}
            >
              Boards của tôi
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Chào {user?.username || user?.email} 👋
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              bgcolor: theme.palette.primary.main,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
              px: 3,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            Tạo Board Mới
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              Bạn chưa có board nào
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                bgcolor: theme.palette.primary.main,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              Tạo Board Đầu Tiên
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={board._id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 20px ${
                        theme.palette.mode === "dark"
                          ? "rgba(0,0,0,0.3)"
                          : "rgba(0,0,0,0.1)"
                      }`,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                  onClick={() => navigate(`/board/${board._id}`)}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 1, color: theme.palette.primary.main }}
                    >
                      {board.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {board.description || "Không có mô tả"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 2,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {board.type === "public" ? "🔓 Công khai" : "🔒 Riêng tư"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/board/${board._id}`);
                      }}
                    >
                      Mở
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(board._id);
                      }}
                    >
                      Xoá
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

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
            bgcolor: theme.palette.background.paper,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.3rem",
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            color: "white",
            borderRadius: "12px 12px 0 0",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddIcon />
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
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
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
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
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
            startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
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
