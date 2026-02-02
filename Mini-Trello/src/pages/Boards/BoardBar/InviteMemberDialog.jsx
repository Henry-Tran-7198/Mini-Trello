import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Box,
  Fade,
  Avatar,
  Chip,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import { userApi } from "~/api/userApi";
import { boardApi } from "~/api/boardApi";

export default function InviteMemberDialog({
  open,
  onClose,
  boardId,
  currentMembers,
  onMemberAdded,
  onMemberRemoved,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = useCallback(
    async (query) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        setError("");
        const response = await userApi.searchUsers(query);

        // Lọc bỏ những user đã là member
        const memberIds = currentMembers?.map((m) => m.id) || [];
        const filtered = response.data.users.filter(
          (u) => !memberIds.includes(u.id),
        );

        setSearchResults(filtered);
      } catch (err) {
        setError("Lỗi khi tìm kiếm user");
      } finally {
        setSearching(false);
      }
    },
    [currentMembers],
  );

  const handleInvite = async (userId) => {
    try {
      setInviting(true);
      setError("");

      await boardApi.inviteMember(boardId, userId);

      setSuccess("Gửi lời mời thành công!");
      setSearchQuery("");
      setSearchResults([]);

      // Callback để update parent component (refetch board)
      if (onMemberAdded) {
        onMemberAdded();
      }

      // Delay closing dialog to show success message
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi lời mời");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setRemoving(memberId);
      setError("");

      await boardApi.removeMember(boardId, memberId);

      setSuccess("Xóa member thành công!");

      // Callback để update parent component
      if (onMemberRemoved) {
        onMemberRemoved(memberId);
      }

      setTimeout(() => {
        setSuccess("");
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xóa member");
    } finally {
      setRemoving(null);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError("");
    setSuccess("");
    onClose();
  };

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
          background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
          color: "white",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <PersonAddIcon />
        Thêm Member
      </DialogTitle>

      <DialogContent
        sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ borderRadius: "8px" }}>
              {error}
            </Alert>
          </Fade>
        )}

        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ borderRadius: "8px" }}>
              {success}
            </Alert>
          </Fade>
        )}

        {/* Search Field */}
        <TextField
          autoFocus
          fullWidth
          label="Tìm kiếm user"
          placeholder="Nhập username hoặc email"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={inviting}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} />,
          }}
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

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box sx={{ maxHeight: "300px", overflow: "auto" }}>
            <List>
              {searchResults.map((user) => (
                <ListItemButton
                  key={user.id}
                  onClick={() => handleInvite(user.id)}
                  disabled={inviting}
                  sx={{
                    borderRadius: "8px",
                    mb: 1,
                    backgroundColor: "rgba(33, 150, 243, 0.05)",
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                    },
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{ mr: 2, width: 40, height: 40 }}
                  />
                  <ListItemText
                    primary={user.username}
                    secondary={user.email}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Current Members List */}
        {currentMembers && currentMembers.length > 0 && (
          <Box>
            <Box
              sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#666", mb: 1 }}
            >
              Hiện tại ({currentMembers.length} thành viên)
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {currentMembers.map((member) => {
                const isPending = member.invitationStatus === "pending";
                return (
                  <Chip
                    key={member.id}
                    avatar={<Avatar src={member.avatar} />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {member.username} ({member.role})
                        {isPending && (
                          <Box
                            component="span"
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: "#FF9800",
                              textTransform: "uppercase",
                              ml: 0.5,
                            }}
                          >
                            Pending
                          </Box>
                        )}
                      </Box>
                    }
                    onDelete={() => handleRemoveMember(member.id)}
                    disabled={removing === member.id}
                    icon={
                      removing === member.id ? (
                        <CircularProgress size={18} sx={{ ml: 1 }} />
                      ) : undefined
                    }
                    variant="outlined"
                    sx={{
                      borderColor: isPending ? "#FF9800" : "#2196F3",
                      backgroundColor: isPending
                        ? "rgba(255, 152, 0, 0.05)"
                        : undefined,
                      "&:hover": {
                        backgroundColor: isPending
                          ? "rgba(255, 152, 0, 0.1)"
                          : "rgba(255, 71, 87, 0.1)",
                        borderColor: isPending ? "#FF9800" : "#FF4757",
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {searchQuery && !searching && searchResults.length === 0 && !error && (
          <Box sx={{ textAlign: "center", py: 2, color: "#999" }}>
            Không tìm thấy user
          </Box>
        )}

        {/* Loading */}
        {searching && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={30} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={inviting}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
