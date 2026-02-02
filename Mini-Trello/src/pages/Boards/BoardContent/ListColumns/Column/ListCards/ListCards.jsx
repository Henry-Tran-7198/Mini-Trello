import Box from "@mui/material/Box";
import Card from "./Card/Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function ListCards({ cards, columnId, onEditCard, onDeleteCard }) {
  // Ensure cards array exists and has valid items
  const validCards = cards && Array.isArray(cards) ? cards : [];
  const cardIds = validCards.map((c) => c._id).filter(Boolean);

  return (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <Box
        sx={{
          p: "0 5px",
          m: "0 5px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowX: "hidden",
          overflowY: "auto",
          maxHeight: (theme) => `calc(
                                ${theme.trello.boardContentHeight} -
                                ${theme.spacing(5)} -
                                ${theme.trello.columnHeaderHeight} -
                                ${theme.trello.columnFooterHeight}
                                )`,
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ced0da",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#bfc2cf",
          },
        }}
      >
        {validCards.map((card) => (
          <Card
            key={card._id}
            card={card}
            columnId={columnId}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </Box>
    </SortableContext>
  );
}

export default ListCards;

// {/* < DndContext >
//     <SortableContext items={["A, "B", "C"]}> => Columns
//         < SortableContext items = { [1, 2, 3]} > => Cards
//         {/* ... */ }
//     </SortableContext >
//   </SortableContext >
// </DndContext > */}
