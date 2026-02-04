import { useState } from "react";
import { Card as MuiCard } from "@mui/material";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardDetailDialog from "~/components/Dialogs/CardDetailDialog";

function Card({ card, columnId, onEditCard, onDeleteCard }) {
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // Property of dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
    data: {
      type: "CARD",
      columnId: columnId,
      cardId: card._id,
    },
  });

  console.log(
    "🔴 Card Component - Card ID:",
    card._id,
    "isDragging:",
    isDragging,
    "has listeners:",
    !!listeners,
  );

  const dndKitCardStyle = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const shouldShowCardActions = () => {
    return (
      !!card?.memberIds?.length ||
      !!card?.comments?.length ||
      !!card?.attachments?.length
    );
  };

  return (
    <MuiCard
      ref={setNodeRef}
      style={dndKitCardStyle}
      {...attributes}
      {...listeners}
      tabIndex={0}
      sx={{
        cursor: isDragging ? "grabbing" : "grab",
        boxShadow: isDragging
          ? "0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)"
          : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        overflow: "visible",
        display: "block",
        height: card?.FE_PlaceholderCard ? 0 : "auto",
        minHeight: 0,
        padding: 0,
        opacity: isDragging ? 0.3 : 1,
        pointerEvents: card?.FE_PlaceholderCard ? "none" : "auto",
        transition: isDragging
          ? "none"
          : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isDragging
          ? "rotate(4deg) scale(1.05)"
          : "rotate(0deg) scale(1)",
        backgroundColor: (theme) => theme.palette.background.paper,
        "&:focus": {
          outline: "2px solid #1976d2",
          outlineOffset: "2px",
        },
        "&:hover": {
          boxShadow: isDragging
            ? "0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)"
            : "0 2px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.23)",
          transform: isDragging
            ? "rotate(4deg) scale(1.05)"
            : "translateY(-2px)",
        },
        "&:hover .card-actions": {
          display: "flex",
        },
        // Highlight when this card is a drop target
        ...(isDragging && {
          borderTop: "3px solid #1976d2",
          borderRadius: "6px",
        }),
      }}
    >
      {card?.cover && (
        <CardMedia
          sx={{ height: 140 }}
          image={card?.cover}
          title="card cover"
        />
      )}
      <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: "0.95rem",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {card?.title}
        </Typography>
      </CardContent>
      {shouldShowCardActions() && (
        <CardActions sx={{ p: "0 4px 8px 4px" }}>
          {!!card?.memberIds?.length && (
            <Button
              size="small"
              startIcon={<GroupIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDetailDialog(true);
              }}
            >
              {card?.memberIds?.length}
            </Button>
          )}
          {!!card?.comments?.length && (
            <Button
              size="small"
              startIcon={<CommentIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDetailDialog(true);
              }}
            >
              {card?.comments?.length}
            </Button>
          )}
          {!!card?.attachments?.length && (
            <Button
              size="small"
              startIcon={<AttachmentIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDetailDialog(true);
              }}
            >
              {card?.attachments?.length}
            </Button>
          )}
        </CardActions>
      )}
      <Box
        className="card-actions"
        sx={{
          display: "none",
          gap: 1,
          p: "8px",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onEditCard?.(card, columnId);
          }}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<MoreIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setOpenDetailDialog(true);
          }}
          sx={{ ml: "auto" }}
        >
          Chi Tiết
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCard?.(card._id, columnId);
          }}
        >
          Delete
        </Button>
      </Box>

      {/* Card Detail Dialog */}
      <CardDetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        card={card}
      />
    </MuiCard>
  );
}

export default Card;
