import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Column from "./Column/Column";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import Button from "@mui/material/Button";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

function ListColumn({
  columns,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
  isLoading,
  overColumnId,
}) {
  // SortableContext yêu cầu items là 1 array dạng['id-1', 'id-2'] chứ không phải [{ id: 'id-1' }, { id: 'id-2' }]
  // Nếu không đúng thì vẫn kéo thả được nhưng không animation
  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: "inherit",
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? "none" : "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            m: 2,
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            },
          },
        }}
      >
        {columns?.map((column) => (
          <Column
            key={column._id}
            column={column}
            onDeleteColumn={onDeleteColumn}
            onRenameColumn={onRenameColumn}
            onAddCard={onAddCard}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            overColumnId={overColumnId}
          />
        ))}

        {!columns || columns.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "300px",
              opacity: 0.6,
              gap: 2,
              px: 4,
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", color: "white" }}>
              No columns yet
            </Typography>
            <Typography
              sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}
            >
              Create your first column to get started
            </Typography>
          </Box>
        ) : null}

        {/* Box Add New Column CTA */}
        <Box
          sx={{
            minWidth: "200px",
            maxWidth: "200px",
            mx: 2,
            borderRadius: "6px",
            height: "fit-content",
            bgcolor: "#ffffff3d",
            transition: "all 0.2s ease",
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? "none" : "auto",
            "&:hover": {
              bgcolor: isLoading ? "#ffffff3d" : "#ffffff52",
              boxShadow: isLoading ? "none" : "0 2px 8px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <Button
            startIcon={<NoteAddIcon />}
            onClick={onAddColumn}
            disabled={isLoading}
            sx={{
              color: "white",
              width: "100%",
              justifyItems: "flex-start",
              pl: 2.5,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              "&:disabled": {
                color: "rgba(255, 255, 255, 0.5)",
                cursor: "not-allowed",
              },
            }}
          >
            Add new column
          </Button>
        </Box>
      </Box>
    </SortableContext>
  );
}

export default ListColumn;
