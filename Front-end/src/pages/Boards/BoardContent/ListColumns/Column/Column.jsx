import Box from "@mui/material/Box";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import { keyframes } from "@mui/system";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import ContentCut from "@mui/icons-material/ContentCut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentPaste from "@mui/icons-material/ContentPaste";
import Cloud from "@mui/icons-material/Cloud";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import TextField from "@mui/material/TextField";
import ListCards from "./ListCards/ListCards";
import { mapOrder } from "~/utils/sorts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Pulse animation for hover effect
const pulseAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.6), 0 12px 32px rgba(76, 175, 80, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.4), 0 12px 32px rgba(76, 175, 80, 0.9);
  }
`;

function Column({
  column,
  onDeleteColumn,
  onRenameColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
  overColumnId,
}) {
  //Property of dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: { ...column },
  });

  const dndKitColumnStyle = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    height: "100%",
    opacity: isDragging ? 0.7 : 1,
  };
  //Property of dnd-kit

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column?.title);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Sorted Columns
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, "_id");

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== column?.title) {
      onRenameColumn(column._id, editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(column?.title);
  };

  return (
    <div ref={setNodeRef} style={dndKitColumnStyle} {...attributes}>
      <Box
        sx={{
          minWidth: "300px",
          maxWidth: "300px",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#333643" : "#ebecf0",
          ml: 2,
          borderRadius: "6px",
          height: "fit-content",
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          boxShadow: isDragging
            ? "0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)"
            : overColumnId === column._id
              ? "0 0 0 3px rgba(76, 175, 80, 0.6), 0 12px 32px rgba(76, 175, 80, 0.7)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          animation:
            overColumnId === column._id
              ? `${pulseAnimation} 2s infinite`
              : "none",
          transition: isDragging
            ? "none"
            : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: isDragging
            ? (theme) => (theme.palette.mode === "dark" ? "#3d3f45" : "#f0f1f4")
            : overColumnId === column._id
              ? (theme) =>
                  theme.palette.mode === "dark" ? "#1b5e20" : "#e8f5e9"
              : undefined,
          transform: isDragging
            ? "scale(1.02)"
            : overColumnId === column._id
              ? "scale(1.01)"
              : "scale(1)",
          border: isDragging
            ? "2px solid #1976d2"
            : overColumnId === column._id
              ? "3px solid #4caf50"
              : "2px solid transparent",
          "&:hover": !isDragging
            ? {
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              }
            : {},
        }}
      >
        {/* Box Column Header */}
        <Box
          {...listeners}
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {isEditing ? (
            <TextField
              size="small"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyPress={(e) => e.key === "Enter" && handleSaveTitle()}
              autoFocus
              sx={{ flex: 1 }}
            />
          ) : (
            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                flex: 1,
              }}
              onDoubleClick={() => setIsEditing(true)}
            >
              {column?.title}
            </Typography>
          )}
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{
                  color: "text.primary",
                  cursor: "pointer",
                }}
                id="basic-column-dropdown"
                aria-controls={open ? "basic-menu-column-dropdown" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-column-dropdown",
              }}
            >
              <MenuItem
                onClick={() => {
                  onAddCard(column._id);
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <AddCardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setIsEditing(true);
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit column name</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>

              <Divider />
              <MenuItem
                onClick={() => {
                  onDeleteColumn(column._id);
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <DeleteForeverIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Box Column Card */}
        <ListCards
          cards={orderedCards}
          columnId={column._id}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
        />

        {/* Box Column Footer */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnFooterHeight,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            startIcon={<AddCardIcon />}
            onClick={() => onAddCard(column._id)}
            sx={{
              color: "text.primary",
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            Add new card
          </Button>
          <Tooltip title="Drag to move">
            <DragHandleIcon
              sx={{
                cursor: "pointer",
                opacity: 0.6,
                transition: "opacity 0.2s ease",
                "&:hover": {
                  opacity: 1,
                },
              }}
            />
          </Tooltip>
        </Box>
      </Box>
    </div>
  );
}

export default Column;
