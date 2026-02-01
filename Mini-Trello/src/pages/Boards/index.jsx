import Board from "./Board";
import { boardApi } from "~/api/boardApi";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

export default function Boards() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.response?.data?.message || "Lỗi khi tải board");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

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
