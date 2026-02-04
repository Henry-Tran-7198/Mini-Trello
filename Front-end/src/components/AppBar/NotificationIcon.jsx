import { useState, useEffect } from "react";
import {
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  IconButton as MUIIconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import { invitationApi } from "~/api/invitationApi";
import { notificationApi } from "~/api/notificationApi";
import eventStream from "~/api/eventStream";

export default function NotificationIcon() {
  const [invitations, setInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [accepting, setAccepting] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [deletingNotif, setDeletingNotif] = useState(null);

  // Load data
  useEffect(() => {
    loadData();

    // Setup real-time listener for notifications
    const handleNewNotification = (event) => {
      if (event.notification) {
        // If it's a board invitation, add to invitations list
        if (event.notification.type === "board_invitation") {
          // Convert notification to invitation format
          const invitation = {
            id: event.notification.data?.invitation_id,
            inviterId: event.notification.data?.inviter_id,
            boardId: event.notification.data?.board_id,
            type: "board_member",
            status: "pending",
            inviter: {
              id: event.notification.data?.inviter_id,
              username: event.notification.data?.inviter_username,
              avatar: null,
            },
            board: {
              id: event.notification.data?.board_id,
              title: event.notification.data?.board_title,
              description: "",
            },
            createdAt: event.notification.createdAt,
          };
          setInvitations((prev) => [invitation, ...prev]);
        } else {
          // Add regular notifications to notifications tab (including board_deleted)
          setNotifications((prev) => [event.notification, ...prev]);
        }
      }
    };

    eventStream.on("notification", handleNewNotification);

    // Connect to real-time event stream
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      eventStream.connect(token);
    }

    // Fallback polling every 30 seconds
    const pollInterval = setInterval(loadData, 30000);

    return () => {
      clearInterval(pollInterval);
      eventStream.off("notification", handleNewNotification);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invitResponse, notifResponse] = await Promise.all([
        invitationApi.getInvitations(),
        notificationApi.getNotifications(),
      ]);
      setInvitations(invitResponse.data.invitations || []);
      setNotifications(notifResponse.data.notifications || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      setAccepting(invitationId);
      await invitationApi.acceptInvitation(invitationId);
      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Error accepting invitation:", error);
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (invitationId) => {
    try {
      setRejecting(invitationId);
      await invitationApi.rejectInvitation(invitationId);
      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    } finally {
      setRejecting(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setDeletingNotif(notificationId);
      await notificationApi.deleteNotification(notificationId);
      // Remove from list
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeletingNotif(null);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const totalCount = invitations.length + notifications.length;

  return (
    <>
      <MUIIconButton
        onClick={handleClick}
        sx={{ color: "white" }}
        aria-label="notifications"
      >
        <Badge badgeContent={totalCount} color="error">
          <NotificationsIcon />
        </Badge>
      </MUIIconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            maxWidth: 420,
            maxHeight: 600,
            overflow: "auto",
          },
        }}
      >
        <Box sx={{ p: 2, minWidth: 400 }}>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            variant="fullWidth"
            sx={{ mb: 2, borderBottom: "1px solid #ddd" }}
          >
            <Tab
              label={`Lời Mời (${invitations.length})`}
              sx={{ textTransform: "none" }}
            />
            <Tab
              label={`Thông Báo (${notifications.length})`}
              sx={{ textTransform: "none" }}
            />
          </Tabs>

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : tabValue === 0 ? (
            /* INVITATIONS TAB */
            invitations.length === 0 ? (
              <Typography sx={{ color: "#999", textAlign: "center", py: 3 }}>
                Không có lời mời nào
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {invitations.map((invitation) => (
                  <Box
                    key={invitation.id}
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: "#f5f5f5",
                      borderLeft: "4px solid #2196F3",
                    }}
                  >
                    {/* Inviter Info */}
                    <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                      <Avatar
                        src={invitation.inviter.avatar}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                        >
                          {invitation.inviter.username}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                          mời bạn vào board
                        </Typography>
                      </Box>
                    </Box>

                    {/* Board Info */}
                    <Box sx={{ mb: 2, pl: 6.5 }}>
                      <Typography sx={{ fontWeight: 500, color: "#1976D2" }}>
                        📌 {invitation.board.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#999" }}>
                        {invitation.board.description}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1, pl: 6.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleAccept(invitation.id)}
                        disabled={
                          accepting === invitation.id ||
                          rejecting === invitation.id
                        }
                        sx={{ flex: 1, textTransform: "none" }}
                      >
                        {accepting === invitation.id ? "..." : "Chấp nhận"}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleReject(invitation.id)}
                        disabled={
                          accepting === invitation.id ||
                          rejecting === invitation.id
                        }
                        sx={{ flex: 1, textTransform: "none" }}
                      >
                        {rejecting === invitation.id ? "..." : "Từ chối"}
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )
          ) : /* NOTIFICATIONS TAB */
          notifications.length === 0 ? (
            <Typography sx={{ color: "#999", textAlign: "center", py: 3 }}>
              Không có thông báo nào
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {notifications.map((notif) => (
                <Box
                  key={notif.id}
                  sx={{
                    p: 2,
                    borderRadius: "8px",
                    bgcolor:
                      notif.type === "board_deleted"
                        ? "#ffebee"
                        : notif.type === "member_rejected"
                          ? "#fff3e0"
                          : notif.type === "member_removed"
                            ? "#ffebee"
                            : "#f5f5f5",
                    borderLeft:
                      notif.type === "board_deleted"
                        ? "4px solid #ff5252"
                        : notif.type === "member_rejected"
                          ? "4px solid #ff9800"
                          : notif.type === "member_removed"
                            ? "4px solid #f44336"
                            : "4px solid #4CAF50",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      {notif.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.85rem", color: "#666", mt: 0.5 }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "#999", mt: 0.5 }}
                    >
                      {new Date(notif.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>
                  <MUIIconButton
                    size="small"
                    onClick={() => handleDeleteNotification(notif.id)}
                    disabled={deletingNotif === notif.id}
                    sx={{ ml: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </MUIIconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
