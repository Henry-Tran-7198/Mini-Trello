import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Snackbar, Alert } from "@mui/material";

// DnD-kit
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// Components
import ListColumn from "./ListColumns/ListColumn";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import ColumnDialog from "~/components/Dialogs/ColumnDialog";
import CardDialog from "~/components/Dialogs/CardDialog";

// Utils
import { mapOrder } from "~/utils/sorts";
import { generatePlaceholderCard } from "~/utils/formatters";
import { cloneDeep, isEmpty } from "lodash";

// API
import { columnApi } from "~/api/columnApi";
import { cardApi } from "~/api/cardApi";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "COLUMN",
  CARD: "CARD",
};

function BoardContent({ board }) {
  const theme = useTheme();

  /* ====================== SENSOR ====================== */
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  /* ====================== STATE ====================== */
  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  // Dialog state
  const [openColumnDialog, setOpenColumnDialog] = useState(false);
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [selectedColumnForCard, setSelectedColumnForCard] = useState(null);
  const [editingCardData, setEditingCardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const lastOverId = useRef(null);

  useEffect(() => {
    if (board?.columns) {
      setOrderedColumns(mapOrder(board.columns, board.columnOrderIds, "_id"));
    }
  }, [board]);

  /* ====================== HELPERS ====================== */
  const findColumnByCardId = (cardId) =>
    orderedColumns.find((col) =>
      col.cards?.some((card) => card._id === cardId),
    );

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeCardId,
    activeCardData,
  ) => {
    setOrderedColumns((prev) => {
      const nextColumns = cloneDeep(prev);

      const nextActiveColumn = nextColumns.find(
        (c) => c._id === activeColumn._id,
      );
      const nextOverColumn = nextColumns.find((c) => c._id === overColumn._id);

      if (!nextActiveColumn || !nextOverColumn) return prev;

      // Remove card from old column
      nextActiveColumn.cards = nextActiveColumn.cards.filter(
        (c) => c._id !== activeCardId,
      );

      if (isEmpty(nextActiveColumn.cards)) {
        nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
      }

      nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((c) => c._id);

      // Insert into new column
      const overIndex = nextOverColumn.cards.findIndex(
        (c) => c._id === overCardId,
      );
      const isBelow =
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const newIndex =
        overIndex >= 0
          ? overIndex + (isBelow ? 1 : 0)
          : nextOverColumn.cards.length;

      nextOverColumn.cards = nextOverColumn.cards
        .filter((c) => !c.FE_PlaceholderCard && c._id !== activeCardId)
        .toSpliced(newIndex, 0, activeCardData);

      nextOverColumn.cardOrderIds = nextOverColumn.cards.map((c) => c._id);

      return nextColumns;
    });
  };

  /* ====================== EVENTS ====================== */
  const handleDragStart = ({ active }) => {
    setActiveDragItemData(active.data.current);

    const isCard = !!active.data.current?.columnId;
    setActiveDragItemType(
      isCard ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN,
    );

    if (isCard) {
      setOldColumnWhenDraggingCard(findColumnByCardId(active.id));
    }
  };

  const handleDragOver = ({ active, over }) => {
    if (!active || !over || activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN)
      return;

    const activeCardId = active.id;
    const overCardId = over.id;

    const activeColumn = findColumnByCardId(activeCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn || activeColumn._id === overColumn._id)
      return;

    moveCardBetweenDifferentColumns(
      overColumn,
      overCardId,
      active,
      over,
      activeColumn,
      activeCardId,
      active.data.current,
    );
  };

  const handleDragEnd = ({ active, over }) => {
    if (!active || !over) return;

    // CARD
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const activeColumn = findColumnByCardId(active.id);
      const overColumn = findColumnByCardId(over.id);

      if (!activeColumn || !overColumn) return;

      if (oldColumnWhenDraggingCard._id === overColumn._id) {
        const oldIndex = oldColumnWhenDraggingCard.cards.findIndex(
          (c) => c._id === active.id,
        );
        const newIndex = overColumn.cards.findIndex((c) => c._id === over.id);

        const newCards = arrayMove(overColumn.cards, oldIndex, newIndex);

        setOrderedColumns((prev) => {
          const next = cloneDeep(prev);
          const target = next.find((c) => c._id === overColumn._id);
          target.cards = newCards;
          target.cardOrderIds = newCards.map((c) => c._id);
          return next;
        });
      }
    }

    // COLUMN
    if (
      activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN &&
      active.id !== over.id
    ) {
      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id);
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id);
      setOrderedColumns(arrayMove(orderedColumns, oldIndex, newIndex));
    }

    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
  };

  /* ====================== COLUMN HANDLERS ====================== */
  const handleAddColumn = async (columnTitle) => {
    setLoading(true);
    try {
      const response = await columnApi.create({
        boardId: board._id,
        title: columnTitle,
      });

      const newColumn = response.data;
      setOrderedColumns((prev) => [...prev, newColumn]);
      setOpenColumnDialog(false);
      showSnackbar("Column created successfully!");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to create column",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (window.confirm("Are you sure you want to delete this column?")) {
      setLoading(true);
      try {
        await columnApi.delete(columnId);
        setOrderedColumns((prev) => prev.filter((col) => col._id !== columnId));
        showSnackbar("Column deleted successfully!");
      } catch (err) {
        showSnackbar(
          err.response?.data?.message || "Failed to delete column",
          "error",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRenameColumn = async (columnId, newTitle) => {
    setLoading(true);
    try {
      await columnApi.update(columnId, { title: newTitle });
      showSnackbar("Column renamed successfully!");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to rename column",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ====================== CARD HANDLERS ====================== */
  const handleAddCard = async (cardData) => {
    setLoading(true);
    try {
      const response = await cardApi.create({
        boardId: board._id,
        columnId: selectedColumnForCard._id,
        title: cardData.title,
        description: cardData.description,
        cover: cardData.cover,
      });

      const newCard = response.data.card;
      setOrderedColumns((prev) =>
        prev.map((col) => {
          if (col._id === selectedColumnForCard._id) {
            return {
              ...col,
              cards: col.cards
                .filter((c) => !c.FE_PlaceholderCard)
                .concat(newCard),
              cardOrderIds: [
                ...col.cardOrderIds.filter((id) => !id.includes("placeholder")),
                newCard._id,
              ],
            };
          }
          return col;
        }),
      );
      setOpenCardDialog(false);
      setSelectedColumnForCard(null);
      showSnackbar("Card created successfully!");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to create card",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCard = async (cardId, cardData) => {
    setLoading(true);
    try {
      const response = await cardApi.update(cardId, {
        title: cardData.title,
        description: cardData.description,
        cover: cardData.cover,
      });

      const updatedCard = response.data.card;
      setOrderedColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card._id === cardId ? updatedCard : card,
          ),
        })),
      );
      setOpenCardDialog(false);
      setEditingCardData(null);
      showSnackbar("Card updated successfully!");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to update card",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId, columnId) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      setLoading(true);
      try {
        await cardApi.delete(cardId);
        setOrderedColumns((prev) =>
          prev.map((col) => {
            if (col._id === columnId) {
              const updatedCards = col.cards.filter(
                (card) => card._id !== cardId,
              );
              return {
                ...col,
                cards:
                  updatedCards.length === 0
                    ? [generatePlaceholderCard(col)]
                    : updatedCards,
                cardOrderIds: updatedCards.map((c) => c._id),
              };
            }
            return col;
          }),
        );
        showSnackbar("Card deleted successfully!");
      } catch (err) {
        showSnackbar(
          err.response?.data?.message || "Failed to delete card",
          "error",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  /* ====================== COLLISION ====================== */
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners(args);
      }

      const pointerIntersections = pointerWithin(args);
      if (!pointerIntersections.length) {
        return lastOverId.current ? [{ id: lastOverId.current }] : [];
      }

      const overId = getFirstCollision(pointerIntersections, "id");
      lastOverId.current = overId;
      return [{ id: overId }];
    },
    [activeDragItemType],
  );

  /* ====================== RENDER ====================== */
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            width: "100%",
            height: theme.trello.boardContentHeight,
            bgcolor: theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
            p: "10px 0",
          }}
        >
          <ListColumn
            columns={orderedColumns}
            onAddColumn={() => setOpenColumnDialog(true)}
            onDeleteColumn={handleDeleteColumn}
            onRenameColumn={handleRenameColumn}
            onAddCard={(columnId) => {
              const col = orderedColumns.find((c) => c._id === columnId);
              setSelectedColumnForCard(col);
              setEditingCardData(null);
              setOpenCardDialog(true);
            }}
            onEditCard={(card, columnId) => {
              setEditingCardData(card);
              setSelectedColumnForCard(
                orderedColumns.find((c) => c._id === columnId),
              );
              setOpenCardDialog(true);
            }}
            onDeleteCard={handleDeleteCard}
          />

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: 0.5 } },
              }),
            }}
          >
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
              <Column column={activeDragItemData} />
            )}
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
              <Card card={activeDragItemData} />
            )}
          </DragOverlay>
        </Box>
      </DndContext>

      <ColumnDialog
        open={openColumnDialog}
        title="Add new column"
        onClose={() => setOpenColumnDialog(false)}
        onSubmit={handleAddColumn}
        loading={loading}
      />

      <CardDialog
        open={openCardDialog}
        title={editingCardData ? "Edit card" : "Add new card"}
        onClose={() => {
          setOpenCardDialog(false);
          setSelectedColumnForCard(null);
          setEditingCardData(null);
        }}
        onSubmit={(cardData) => {
          if (editingCardData) {
            return handleUpdateCard(editingCardData._id, cardData);
          } else {
            return handleAddCard(cardData);
          }
        }}
        loading={loading}
        initialData={editingCardData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default BoardContent;
