import { Card as MuiCard } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Simplified Card component for DragOverlay (no sortable logic needed)
function CardOverlay({ card }) {
  if (!card) return null;

  return (
    <MuiCard
      sx={{
        cursor: "grabbing",
        boxShadow:
          "0 20px 50px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3)",
        overflow: "visible",
        display: "block",
        height: "auto",
        minHeight: 0,
        padding: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        width: 272,
        opacity: 1,
      }}
    >
      {card?.cover && (
        <CardMedia
          component="img"
          height="140"
          image={card.cover}
          alt={card.title}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography
          variant="body2"
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            fontWeight: 500,
            fontSize: "0.95rem",
            color: (theme) => theme.palette.text.primary,
          }}
        >
          {card?.title || "Untitled"}
        </Typography>
      </CardContent>
    </MuiCard>
  );
}

export default CardOverlay;
