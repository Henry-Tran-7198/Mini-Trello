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

  // Debug log
  console.log(`Card [${card._id}] - columnId: ${columnId}, type: CARD`);

  const dndKitCardStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? "1px solid #2ecc71" : undefined,
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
      sx={{
        cursor: "grab",
        boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
        overflow: "visible",
        display: "block",
        height: card?.FE_PlaceholderCard ? 0 : "auto",
        minHeight: 0,
        padding: 0,
        opacity: card?.FE_PlaceholderCard ? 0 : 1,
        pointerEvents: card?.FE_PlaceholderCard ? "none" : "auto",
        "&:active": {
          cursor: "grabbing",
        },
        "&:hover .card-actions": {
          display: "flex",
        },
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
        <Typography>{card?.title}</Typography>
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
