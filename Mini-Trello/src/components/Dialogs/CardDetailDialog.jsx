import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Card as MuiCard,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { cardApi } from "~/api/cardApi";
import { userApi } from "~/api/userApi";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ width: "100%" }}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function CardDetailDialog({
  open,
  onClose,
  card,
  onCardUpdated,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load card details
  useEffect(() => {
    if (open && card?.id) {
      loadCardDetails();
    }
  }, [open, card?.id]);

  const loadCardDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await cardApi.getCard(card.id);
      const cardData = response.data.card;

      setMembers(cardData.members || []);
      setComments(cardData.comments || []);
      setAttachments(cardData.attachments || []);
    } catch (err) {
      setError("Lỗi khi tải chi tiết card");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [card?.id]);

  // Search users to add as member
  const handleSearchMembers = useCallback(
    async (query) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const response = await userApi.searchUsers(query);
        const memberIds = members.map((m) => m.id);
        const filtered = response.data.users.filter(
          (u) => !memberIds.includes(u.id),
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    },
    [members],
  );

  // Add member to card
  const handleAddMember = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        await cardApi.addMemberToCard(card.id, userId);
        setSuccess("Thêm member thành công!");
        setSearchQuery("");
        setSearchResults([]);
        await loadCardDetails();
        if (onCardUpdated) onCardUpdated();
      } catch (err) {
        setError("Lỗi khi thêm member");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [card.id, loadCardDetails, onCardUpdated],
  );

  // Remove member from card
  const handleRemoveMember = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        await cardApi.removeMemberFromCard(card.id, userId);
        setSuccess("Xóa member thành công!");
        await loadCardDetails();
        if (onCardUpdated) onCardUpdated();
      } catch (err) {
        setError("Lỗi khi xóa member");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [card.id, loadCardDetails, onCardUpdated],
  );

  // Post comment
  const handlePostComment = useCallback(async () => {
    if (!newComment.trim()) {
      setError("Bình luận không được để trống");
      return;
    }

    try {
      setPosting(true);
      setError("");
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      await cardApi.createComment(card.id, userId, newComment);
      setSuccess("Bình luận thành công!");
      setNewComment("");
      await loadCardDetails();
      if (onCardUpdated) onCardUpdated();
    } catch (err) {
      setError("Lỗi khi đăng bình luận");
      console.error(err);
    } finally {
      setPosting(false);
    }
  }, [card.id, newComment, loadCardDetails, onCardUpdated]);

  // Delete comment
  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        setLoading(true);
        await cardApi.deleteComment(commentId);
        setSuccess("Xóa bình luận thành công!");
        await loadCardDetails();
        if (onCardUpdated) onCardUpdated();
      } catch (err) {
        setError("Lỗi khi xóa bình luận");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [loadCardDetails, onCardUpdated],
  );

  // Delete attachment
  const handleDeleteAttachment = useCallback(
    async (attachmentId) => {
      try {
        setLoading(true);
        await cardApi.deleteAttachment(attachmentId);
        setSuccess("Xóa tệp thành công!");
        await loadCardDetails();
        if (onCardUpdated) onCardUpdated();
      } catch (err) {
        setError("Lỗi khi xóa tệp");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [loadCardDetails, onCardUpdated],
  );

  // Add attachment (for now, just handle URL input)
  const handleAddAttachment = useCallback(async () => {
    const fileURL = prompt("Nhập URL của tệp:");
    const fileName = prompt("Nhập tên tệp:");
    const fileType = prompt("Nhập loại tệp (ví dụ: application/pdf):");

    if (fileURL && fileName && fileType) {
      try {
        setLoading(true);
        await cardApi.addAttachment(card.id, fileName, fileType, fileURL);
        setSuccess("Thêm tệp thành công!");
        await loadCardDetails();
        if (onCardUpdated) onCardUpdated();
      } catch (err) {
        setError("Lỗi khi thêm tệp");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [card.id, loadCardDetails, onCardUpdated]);

  if (!card) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
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
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>{card.title}</span>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2, mb: 0, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ m: 2, mb: 0, borderRadius: "8px" }}>
            {success}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                backgroundColor: "white",
                borderBottom: "1px solid #e0e0e0",
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "1rem",
                  "&.Mui-selected": { color: "#2196F3", fontWeight: 600 },
                },
              }}
            >
              <Tab label="👥 Thành Viên" />
              <Tab label="💬 Bình Luận" />
              <Tab label="📎 Tệp Đính Kèm" />
            </Tabs>

            {/* Members Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box
                sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Current Members */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "#666" }}
                  >
                    Thành viên hiện tại ({members.length})
                  </Typography>
                  {members.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {members.map((member) => (
                        <Chip
                          key={member.id}
                          avatar={
                            <Avatar
                              src={member.avatar}
                              sx={{ width: 32, height: 32 }}
                            />
                          }
                          label={member.username}
                          onDelete={() => handleRemoveMember(member.id)}
                          variant="outlined"
                          sx={{
                            borderColor: "#2196F3",
                            "&:hover": {
                              backgroundColor: "rgba(33, 150, 243, 0.1)",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#999" }}>
                      Chưa có thành viên nào
                    </Typography>
                  )}
                </Box>

                <Divider />

                {/* Search & Add Members */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "#666" }}
                  >
                    Thêm thành viên
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm username hoặc email"
                    value={searchQuery}
                    onChange={(e) => handleSearchMembers(e.target.value)}
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&:hover fieldset": { borderColor: "#2196F3" },
                      },
                    }}
                  />

                  {searching && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  {searchResults.length > 0 && (
                    <List sx={{ mt: 1, maxHeight: "200px", overflow: "auto" }}>
                      {searchResults.map((user) => (
                        <ListItem
                          key={user.id}
                          secondaryAction={
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PersonAddIcon />}
                              onClick={() => handleAddMember(user.id)}
                              disabled={loading}
                              sx={{ borderRadius: "8px" }}
                            >
                              Thêm
                            </Button>
                          }
                          sx={{
                            backgroundColor: "rgba(33, 150, 243, 0.05)",
                            borderRadius: "8px",
                            mb: 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={user.avatar} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.username}
                            secondary={user.email}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Box>
            </TabPanel>

            {/* Comments Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Comment Input */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Viết bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={posting}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handlePostComment}
                    disabled={posting || !newComment.trim()}
                    sx={{
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                      alignSelf: "flex-start",
                      mt: "auto",
                    }}
                  >
                    Gửi
                  </Button>
                </Box>

                <Divider />

                {/* Comments List */}
                {comments.length > 0 ? (
                  <List>
                    {comments.map((comment) => (
                      <MuiCard
                        key={comment.id}
                        sx={{
                          mb: 1,
                          p: 2,
                          backgroundColor: "rgba(0,0,0,0.02)",
                          borderRadius: "8px",
                          border: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                          <Avatar
                            src={comment.user?.avatar}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {comment.user?.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#999" }}
                            >
                              {new Date(comment.createdAt).toLocaleString(
                                "vi-VN",
                              )}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={loading}
                            sx={{
                              color: "#f44336",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "#333", whiteSpace: "pre-wrap" }}
                        >
                          {comment.content}
                        </Typography>
                      </MuiCard>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#999", textAlign: "center", py: 2 }}
                  >
                    Chưa có bình luận nào
                  </Typography>
                )}
              </Box>
            </TabPanel>

            {/* Attachments Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box
                sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Button
                  variant="contained"
                  startIcon={<AttachFileIcon />}
                  onClick={handleAddAttachment}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                    alignSelf: "flex-start",
                  }}
                >
                  Thêm Tệp
                </Button>

                {attachments.length > 0 ? (
                  <List>
                    {attachments.map((attachment) => (
                      <Paper
                        key={attachment.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "rgba(0,0,0,0.02)",
                          borderRadius: "8px",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {attachment.fileName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {attachment.fileType}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            href={attachment.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: "#2196F3" }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteAttachment(attachment.id)
                            }
                            disabled={loading}
                            sx={{
                              color: "#f44336",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#999", textAlign: "center", py: 2 }}
                  >
                    Chưa có tệp nào đính kèm
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
