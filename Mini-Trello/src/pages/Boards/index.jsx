import Board from "./Board";
import { boardApi } from "~/api/boardApi";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Snackbar, Alert } from "@mui/material";

export default function Boards() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        if (boardId) {
          const response = await boardApi.getBoard(boardId);
          setBoard(response.data.board);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching board:", err);
        const errorMessage = err.response?.data?.message || "Lỗi khi tải board";

        // If 403 Unauthorized, user was removed from board
        if (err.response?.status === 403) {
          setError("Bạn không còn quyền truy cập board này");
          setShowSnackbar(true);
          // Redirect to boards list after 2 seconds
          setTimeout(() => {
            navigate("/boards");
          }, 2000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId, navigate]);

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

  if (error) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Snackbar
          open={showSnackbar}
          autoHideDuration={2000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
        <div>Error: {error}</div>
      </Box>
    );
  }

  if (!board) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>Board not found</div>
      </Box>
    );
  }

  return <Board board={board} />;
}
