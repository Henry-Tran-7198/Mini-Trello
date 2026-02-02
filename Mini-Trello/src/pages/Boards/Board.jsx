/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Board Page (Main)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { boardApi } from "~/api/boardApi";
import eventStream from "~/api/eventStream";

export default function Board({ board }) {
  const navigate = useNavigate();
  const [currentBoard, setCurrentBoard] = useState(board);

  const handleMemberRemoved = async (memberId) => {
    // Remove member from local board state
    setCurrentBoard((prev) => ({
      ...prev,
      users: prev.users.filter((user) => user.id !== memberId),
    }));

    // Verify that current user still has access to the board
    try {
      const response = await boardApi.getBoard(board._id);
      // If success, user still has access, update board state
      setCurrentBoard(response.data.board);
    } catch (error) {
      // If 403, user no longer has access, redirect to boards list
      if (error.response?.status === 403) {
        navigate("/boards");
      }
    }
  };

  const handleMemberAdded = async () => {
    // Refetch board data to get updated members and pending invitations
    try {
      const response = await boardApi.getBoard(board._id);
      setCurrentBoard(response.data.board);
    } catch (error) {
      console.error("Error fetching board after member added:", error);
    }
  };

  // Real-time polling to check if user still has access to the board
  useEffect(() => {
    // Setup real-time listener for member removal
    const handleMemberRemoved = (event) => {
      const userId = localStorage.getItem("userId");
      if (event.userId === userId || event.userId === parseInt(userId)) {
        // User was removed from board, redirect immediately
        navigate("/boards");
      }
    };

    // Setup real-time listener for board deletion
    const handleBoardDeleted = (event) => {
      // Board was deleted, redirect immediately
      navigate("/boards");
    };

    eventStream.on("memberRemoved", handleMemberRemoved);
    eventStream.on("boardDeleted", handleBoardDeleted);

    // Connect to real-time event stream if not already connected
    const token = localStorage.getItem("token");
    if (token && !eventStream.isConnected()) {
      eventStream.connect(token);
    }

    // Fallback polling every 15 seconds
    const interval = setInterval(async () => {
      try {
        const response = await boardApi.getBoard(board._id);
        setCurrentBoard(response.data.board);
      } catch (error) {
        // If 403 or 404, user was removed or board was deleted, redirect
        if (error.response?.status === 403 || error.response?.status === 404) {
          navigate("/boards");
        }
      }
    }, 15000); // Check every 15 seconds

    return () => {
      clearInterval(interval);
      eventStream.off("memberRemoved", handleMemberRemoved);
      eventStream.off("boardDeleted", handleBoardDeleted);
    };
  }, [board._id, navigate]);

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* App Bar */}
      <AppBar />

      {/* Board Bar */}
      <BoardBar
        board={currentBoard}
        onMembersChange={handleMemberAdded}
        onMemberRemoved={handleMemberRemoved}
      />

      {/* Board Content */}
      <BoardContent board={currentBoard} />
    </Container>
  );
}
