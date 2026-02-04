import { useTheme } from "@mui/material/styles";
import { useState } from "react";

// MUI
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Tooltip from "@mui/material/Tooltip";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";
import BoltIcon from "@mui/icons-material/Bolt";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Utils
import { capitalizeFirstLetter } from "~/utils/formatters";
import InviteMemberDialog from "./InviteMemberDialog";

const MENU_STYLES = {
  color: "white",
  bgcolor: "transparent",
  border: "none",
  px: "6px",
  borderRadius: "4px",
  ".MuiSvgIcon-root": { color: "white" },
  "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
};

function BoardBar({ board, onMembersChange, onMemberRemoved }) {
  const theme = useTheme();
  const [openInviteDialog, setOpenInviteDialog] = useState(false);

  const getMembers = () => {
    // Lấy user data từ board.users array
    return board?.users || [];
  };

  const handleMemberAdded = () => {
    if (onMembersChange) {
      onMembersChange();
    }
  };

  const handleMemberRemoved = (memberId) => {
    if (onMemberRemoved) {
      onMemberRemoved(memberId);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        gap: 2,
        overflowX: "auto",
        bgcolor: theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
      }}
    >
      {/* LEFT */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Chip
          icon={<DashboardIcon />}
          label={board?.title || "Board"}
          clickable
          sx={MENU_STYLES}
        />

        <Chip
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type || "public")}
          clickable
          sx={MENU_STYLES}
        />

        <Chip
          icon={<AddToDriveIcon />}
          label="Add to Drive"
          clickable
          sx={MENU_STYLES}
        />

        <Chip
          icon={<BoltIcon />}
          label="Automation"
          clickable
          sx={MENU_STYLES}
        />

        <Chip
          icon={<FilterListIcon />}
          label="Filters"
          clickable
          sx={MENU_STYLES}
        />
      </Box>

      {/* RIGHT */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenInviteDialog(true)}
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": {
              borderColor: "white",
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Invite
        </Button>

        <AvatarGroup
          max={5}
          sx={{
            "& .MuiAvatar-root": {
              width: 34,
              height: 34,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              bgcolor: "#a4b0de",
              position: "relative",
            },
          }}
        >
          {getMembers().map((member) => {
            const isPending = member.invitationStatus === "pending";
            return (
              <Box
                key={member.id}
                sx={{
                  position: "relative",
                }}
              >
                <Tooltip
                  title={`${member.username} (${member.role})${isPending ? " - Pending" : ""}`}
                >
                  <Avatar alt={member.username} src={member.avatar} />
                </Tooltip>
                {isPending && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#FF9800",
                      border: "2px solid white",
                    }}
                  />
                )}
              </Box>
            );
          })}
        </AvatarGroup>
      </Box>

      {/* Invite Dialog */}
      <InviteMemberDialog
        open={openInviteDialog}
        onClose={() => setOpenInviteDialog(false)}
        boardId={board?._id}
        currentMembers={getMembers()}
        onMemberAdded={handleMemberAdded}
        onMemberRemoved={handleMemberRemoved}
      />
    </Box>
  );
}

export default BoardBar;
