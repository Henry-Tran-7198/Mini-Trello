import Box from "@mui/material/Box";
import Card from "./Card/Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function ListCards({ cards, columnId, onEditCard, onDeleteCard }) {
  // Ensure cards array exists and has valid items
  const allCards = cards && Array.isArray(cards) ? cards : [];

  // Filter out cards with missing IDs and remove duplicates
  const cardMap = new Map();
  allCards.forEach((card) => {
    if (card._id) {
      cardMap.set(card._id, card);
    }
  });

  const validCards = Array.from(cardMap.values());
  const cardIds = validCards.map((c) => c._id);

  console.log(
    "🔴 ListCards - Column ID:",
    columnId,
    "Cards count:",
    validCards.length,
    "Card IDs:",
    cardIds,
  );

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
          transition: "background-color 0.2s ease",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ced0da",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#bfc2cf",
            },
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
