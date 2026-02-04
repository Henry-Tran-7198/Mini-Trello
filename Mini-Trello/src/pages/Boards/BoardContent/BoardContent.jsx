import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Snackbar, Alert, CircularProgress, Backdrop } from "@mui/material";

// DnD-kit
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
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
import CardOverlay from "./ListColumns/Column/ListCards/Card/CardOverlay";
import ColumnDialog from "~/components/Dialogs/ColumnDialog";
import CardDialog from "~/components/Dialogs/CardDialog";

// Utils
import { mapOrder } from "~/utils/sorts";
import { generatePlaceholderCard } from "~/utils/formatters";
import { isEmpty } from "lodash";

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
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 500 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  /* ====================== STATE ====================== */
  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);

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
  const draggedCardOrderRef = useRef(null);
  const draggedCardFromColumnRef = useRef(null);
  const draggedCardToColumnRef = useRef(null);
  const isDragEndProcessingRef = useRef(false);

  // Helper: Sort board columns and their cards properly
  const sortBoardData = (boardData) => {
    const orderedCols = mapOrder(
      boardData.columns,
      boardData.columnOrderIds,
      "_id",
    );

    // Also sort cards within each column by orderCard
    return orderedCols.map((col) => ({
      ...col,
      cards: col.cards
        ? [...col.cards].sort((a, b) => (a.orderCard || 0) - (b.orderCard || 0))
        : [],
    }));
  };

  useEffect(() => {
    if (board?.columns) {
      const sorted = sortBoardData(board);
      console.log("📊 Board Updated - Columns:", sorted);
      setOrderedColumns(sorted);
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
      const nextColumns = [...prev];
      const activeColIdx = nextColumns.findIndex(
        (c) => c._id === activeColumn._id,
      );
      const overColIdx = nextColumns.findIndex((c) => c._id === overColumn._id);

      if (activeColIdx === -1 || overColIdx === -1) return prev;

      const nextActiveColumn = nextColumns[activeColIdx];
      const nextOverColumn = nextColumns[overColIdx];

      // Remove card from old column
      const activeCards = nextActiveColumn.cards.filter(
        (c) => c._id !== activeCardId,
      );

      const hasCards = !isEmpty(activeCards);
      nextColumns[activeColIdx] = {
        ...nextActiveColumn,
        cards: hasCards
          ? activeCards
          : [generatePlaceholderCard(nextActiveColumn)],
        cardOrderIds: (hasCards
          ? activeCards
          : [generatePlaceholderCard(nextActiveColumn)]
        ).map((c) => c._id),
      };

      // Insert into new column
      const overIndex = nextOverColumn.cards.findIndex(
        (c) => c._id === overCardId && !c.FE_PlaceholderCard,
      );

      // Xoá placeholder cards trước khi thêm card mới
      const filteredCards = nextOverColumn.cards.filter(
        (c) => !c.FE_PlaceholderCard && c._id !== activeCardId,
      );

      const newIndex = overIndex >= 0 ? overIndex : filteredCards.length;
      const newCards = [...filteredCards];
      newCards.splice(newIndex, 0, activeCardData);

      nextColumns[overColIdx] = {
        ...nextOverColumn,
        cards: newCards,
        cardOrderIds: newCards.map((c) => c._id),
      };

      return nextColumns;
    });
  };

  /* ====================== EVENTS ====================== */
  const handleDragStart = ({ active }) => {
    console.log("🔴🔴🔴 DRAG START CALLED - Active ID:", active?.id);
    console.log("🔴 Active data.current:", active?.data?.current);
    // Xác định loại item dựa trên data
    const isCard = active?.data?.current?.type === "CARD";

    console.log(
      "🟢 Drag Start - Active ID:",
      active.id,
      "Type:",
      isCard ? "CARD" : "COLUMN",
    );

    // Get full object for DragOverlay
    let fullData = null;
    if (isCard) {
      // Find the card in orderedColumns
      const column = findColumnByCardId(active.id);
      if (column) {
        fullData = column.cards.find((c) => c._id === active.id);
      }
    } else {
      // Find the column
      fullData = orderedColumns.find((col) => col._id === active.id);
    }

    setActiveDragItemType(
      isCard ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN,
    );
    setActiveDragItemData(fullData || active.data.current);
  };

  const handleDragOver = ({ active, over }) => {
    console.log("🟡 DRAG OVER - Active ID:", active?.id, "Over ID:", over?.id);
    if (!active || !over || activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN)
      return;

    const activeCardId = active.id;
    const overCardId = over.id;

    console.log(
      "🟡 Drag Over - Active Card:",
      activeCardId,
      "Over Card:",
      overCardId,
    );

    if (activeCardId === overCardId) return;

    const activeColumn = findColumnByCardId(activeCardId);
    const overColumn = findColumnByCardId(overCardId);

    console.log("🟡 findColumnByCardId results:", {
      activeCardId,
      activeColumnFound: !!activeColumn,
      overCardId,
      overColumnFound: !!overColumn,
      allColumns: orderedColumns.map((c) => ({
        id: c._id,
        cardIds: c.cards?.map((card) => card._id),
      })),
    });

    // Check if overCardId is actually a column ID
    const overColumnDirect = orderedColumns.find((c) => c._id === overCardId);
    if (overColumnDirect && !overColumn) {
      console.log("🟡 Over is a COLUMN directly, not a card");
      setOverColumnId(overColumnDirect._id);
      draggedCardToColumnRef.current = overColumnDirect._id;
      return;
    }

    console.log(
      "🟡 Active Column Found:",
      !!activeColumn,
      "Over Column Found:",
      !!overColumn,
    );

    if (!activeColumn || !overColumn) return;

    // Store for handleDragEnd
    draggedCardFromColumnRef.current = activeColumn._id;
    draggedCardToColumnRef.current = overColumn._id;

    // Update over column for hover effect
    setOverColumnId(overColumn._id);

    console.log("🟡 Stored Column Refs:", {
      from: draggedCardFromColumnRef.current,
      to: draggedCardToColumnRef.current,
      activeColId: activeColumn._id,
      overColId: overColumn._id,
    });

    // Kéo card qua column khác
    if (activeColumn._id !== overColumn._id) {
      // Chỉ update UI, không save API (save ở handleDragEnd)
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeCardId,
        active.data.current,
      );
    } else {
      // Kéo card trong cùng column - cập nhật visual
      const activeIndex = activeColumn.cards.findIndex(
        (c) => c._id === activeCardId,
      );
      const overIndex = overColumn.cards.findIndex((c) => c._id === overCardId);

      // Chỉ update nếu vị trí thực sự khác
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        draggedCardOrderRef.current = { from: activeIndex, to: overIndex };

        setOrderedColumns((prev) => {
          const nextColumns = [...prev];
          const targetColumnIdx = nextColumns.findIndex(
            (c) => c._id === activeColumn._id,
          );

          if (targetColumnIdx === -1) return prev;

          const targetColumn = nextColumns[targetColumnIdx];
          const newCards = arrayMove(
            targetColumn.cards,
            activeIndex,
            overIndex,
          );

          nextColumns[targetColumnIdx] = {
            ...targetColumn,
            cards: newCards,
            cardOrderIds: newCards.map((c) => c._id),
          };
          return nextColumns;
        });
      }
    }
  };

  const handleDragEnd = ({ active, over }) => {
    console.log(
      "🔴🔴🔴 DRAG END CALLED - Active:",
      active?.id,
      "Over:",
      over?.id,
    );

    // Prevent duplicate processing
    if (isDragEndProcessingRef.current) return;
    if (!active || !over) return;

    console.log("🔴 Drag End - Active ID:", active.id, "Over ID:", over.id);
    console.log("🔴 Drag Type:", activeDragItemType);
    console.log("🔴 Refs at dragEnd:", {
      fromRef: draggedCardFromColumnRef.current,
      toRef: draggedCardToColumnRef.current,
    });

    // CARD
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const activeColumn = findColumnByCardId(active.id);
      console.log("🔴 activeColumn found:", activeColumn?._id);

      const overColumn = draggedCardToColumnRef.current
        ? orderedColumns.find((c) => c._id === draggedCardToColumnRef.current)
        : findColumnByCardId(over.id);

      console.log(
        "🔴 overColumn found:",
        overColumn?._id,
        "method:",
        draggedCardToColumnRef.current ? "from ref" : "by over.id",
      );

      console.log(
        "🔴 Active Column:",
        activeColumn?._id,
        "Over Column:",
        overColumn?._id,
      );

      // Fallback to refs if columns not found (card might have been moved in UI)
      const fromColumnId =
        draggedCardFromColumnRef.current || activeColumn?._id;
      const toColumnId = draggedCardToColumnRef.current || overColumn?._id;

      if (!fromColumnId || !toColumnId) {
        console.log("❌ Columns not found - returning early");
        console.log(
          "❌ draggedCardFromColumnRef:",
          draggedCardFromColumnRef.current,
          "draggedCardToColumnRef:",
          draggedCardToColumnRef.current,
        );
        console.log(
          "❌ All available columns:",
          orderedColumns.map((c) => ({ _id: c._id, title: c.title })),
        );
        // Clear refs and return early
        draggedCardOrderRef.current = null;
        draggedCardFromColumnRef.current = null;
        draggedCardToColumnRef.current = null;
        return;
      }

      // Get the current card index in the target column
      const targetColumn = orderedColumns.find((c) => c._id === toColumnId);
      if (!targetColumn) {
        console.log("❌ Target column not found in orderedColumns");
        draggedCardOrderRef.current = null;
        draggedCardFromColumnRef.current = null;
        draggedCardToColumnRef.current = null;
        return;
      }

      const overCardIndex = targetColumn.cards.findIndex(
        (c) => c._id === over.id,
      );

      // Calculate the drop index based on current position
      // If we're moving into the same column, use the stored ref data
      // Otherwise, drop it just before the over card (or at end)
      let newIndex =
        overCardIndex !== -1 ? overCardIndex : overColumn.cards.length;

      console.log(
        "🔴 New Index:",
        newIndex,
        "From:",
        fromColumnId,
        "To:",
        toColumnId,
      );

      // Only save if there was actual movement
      const hasMovement =
        fromColumnId !== toColumnId ||
        (draggedCardOrderRef.current &&
          draggedCardOrderRef.current.from !== newIndex);

      console.log("🔴 Has Movement Check:", {
        fromColumnId,
        toColumnId,
        columnsDifferent: fromColumnId !== toColumnId,
        draggedCardOrderRef: draggedCardOrderRef.current,
        newIndex,
        orderChanged:
          draggedCardOrderRef.current &&
          draggedCardOrderRef.current.from !== newIndex,
        hasMovement,
      });

      if (hasMovement && newIndex >= 0) {
        console.log("✅ Calling card move API");
        console.log("🔴 Card ID being sent:", active.id);
        console.log("🔴 Active data:", active.data.current);
        console.log("🔴 Request payload:", {
          cardId: active.id,
          toColumnId: toColumnId,
          orderCard: newIndex,
        });
        isDragEndProcessingRef.current = true;

        // Store current state for optimistic revert on error
        const previousColumns = [...orderedColumns];

        // Add timeout to detect if request hangs
        const timeoutId = setTimeout(() => {
          console.error("❌ API REQUEST TIMEOUT - No response after 10s");
        }, 10000);

        console.log(
          "🔴 About to call cardApi.move with payload:",
          JSON.stringify({
            cardId: active.id,
            toColumnId: toColumnId,
            orderCard: newIndex,
          }),
        );

        // Validate payload types
        console.log("🔴 Payload types:", {
          cardId_type: typeof active.id,
          cardId_value: active.id,
          toColumnId_type: typeof toColumnId,
          toColumnId_value: toColumnId,
          toColumnId_isString: typeof toColumnId === "string",
          newIndex_type: typeof newIndex,
          newIndex_value: newIndex,
          newIndex_isNumber: typeof newIndex === "number",
        });

        // Validate that toColumnId exists in orderedColumns
        const targetColumnExists = orderedColumns.some(
          (c) => c._id === toColumnId,
        );
        console.log(
          "🔴 Target column exists in board?",
          targetColumnExists,
          "Searching for:",
          toColumnId,
        );
        console.log(
          "🔴 Available columns:",
          orderedColumns.map((c) => ({ _id: c._id, title: c.title })),
        );

        cardApi
          .move(active.id, {
            toColumnId: toColumnId,
            orderCard: newIndex,
          })
          .then((response) => {
            clearTimeout(timeoutId);
            console.log("✅ API RESPONSE RECEIVED:", response?.status);
            console.log("✅ Card move success:", response);
            console.log("✅ Response data:", response?.data);

            // Handle optimized response: only card data returned
            if (response?.data?.card) {
              const movedCard = response.data.card;

              // Update local state with moved card
              setOrderedColumns((prev) => {
                const nextColumns = [...prev];

                // 1. Remove card from old column (use fromColumnId ref)
                const oldColIdx = nextColumns.findIndex(
                  (c) => c._id === fromColumnId,
                );
                if (oldColIdx !== -1) {
                  nextColumns[oldColIdx] = {
                    ...nextColumns[oldColIdx],
                    cards: nextColumns[oldColIdx].cards.filter(
                      (c) => c._id !== movedCard._id,
                    ),
                  };

                  // Re-sequence old column
                  nextColumns[oldColIdx].cards = nextColumns[
                    oldColIdx
                  ].cards.map((c, idx) => ({
                    ...c,
                    orderCard: idx,
                  }));

                  // Update cardOrderIds
                  nextColumns[oldColIdx].cardOrderIds = nextColumns[
                    oldColIdx
                  ].cards.map((c) => c._id);
                }

                // 2. Add card to new column and re-sequence ALL cards
                const newColIdx = nextColumns.findIndex(
                  (c) => c._id === movedCard.columnId,
                );
                if (newColIdx !== -1) {
                  // Insert moved card into new column
                  const newCards = [...nextColumns[newColIdx].cards];
                  newCards.splice(movedCard.orderCard, 0, movedCard);

                  // Re-sequence ALL cards in new column (0, 1, 2, ...)
                  const reSequencedCards = newCards.map((c, idx) => ({
                    ...c,
                    orderCard: idx,
                  }));

                  nextColumns[newColIdx] = {
                    ...nextColumns[newColIdx],
                    cards: reSequencedCards,
                    cardOrderIds: reSequencedCards.map((c) => c._id),
                  };
                }

                return nextColumns;
              });

              showSnackbar("Card moved successfully!");
            } else if (response?.data?.board) {
              // Fallback: full board response
              const updatedBoard = response.data.board;
              setOrderedColumns(sortBoardData(updatedBoard));
              showSnackbar("Card moved successfully!");
            } else {
              showSnackbar("Card moved successfully!");
            }
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            console.error("❌ CATCH BLOCK EXECUTED - Card move error");
            console.error("❌ Error object:", err);
            console.error("❌ Error status:", err?.response?.status);
            console.error("❌ Error message:", err?.response?.data?.message);
            console.error("❌ Error full response:", err?.response?.data);
            console.error("❌ Is network error?", !err?.response);
            // Revert UI state on error
            setOrderedColumns(previousColumns);
            showSnackbar(
              err.response?.data?.message || "Failed to move card",
              "error",
            );
          })
          .finally(() => {
            clearTimeout(timeoutId);
            console.log("🔴 FINALLY BLOCK - Card move processing complete");
            isDragEndProcessingRef.current = false;
          });
      } else {
        console.log("❌ No movement detected or invalid index", {
          hasMovement,
          newIndex,
        });
      }

      // Clear refs
      draggedCardOrderRef.current = null;
      draggedCardFromColumnRef.current = null;
      draggedCardToColumnRef.current = null;
      setOverColumnId(null);
    }

    // COLUMN
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Ensure we have valid over item
      if (!over) {
        console.log("❌ Column drag: No over item found");
        setActiveDragItemType(null);
        setActiveDragItemData(null);
        return;
      }

      // Skip if dragging over itself
      if (active.id === over.id) {
        console.log("❌ Column drag: Dragging over itself");
        setActiveDragItemType(null);
        setActiveDragItemData(null);
        return;
      }

      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id);
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id);

      console.log(
        "🟦 Column drag - oldIndex:",
        oldIndex,
        "newIndex:",
        newIndex,
        "active.id:",
        active.id,
        "over.id:",
        over.id,
      );

      // Only proceed if both indices are valid
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        isDragEndProcessingRef.current = true;

        const newColumns = arrayMove(orderedColumns, oldIndex, newIndex);
        setOrderedColumns(newColumns);

        // Lưu order mới lên database
        const columnOrderIds = newColumns.map((col) => col._id);
        const boardId = board._id || board.id;
        columnApi
          .updateOrder(boardId, columnOrderIds)
          .then((response) => {
            // Verify with server response
            if (response?.data?.columnOrderIds) {
              setOrderedColumns((prev) => {
                return prev.sort(
                  (a, b) =>
                    response.data.columnOrderIds.indexOf(a._id) -
                    response.data.columnOrderIds.indexOf(b._id),
                );
              });
            }
            showSnackbar("Column order updated successfully!");
          })
          .catch((err) => {
            showSnackbar(
              err.response?.data?.message || "Failed to update column order",
              "error",
            );
            // Revert to old order on error
            setOrderedColumns(sortBoardData(board));
          })
          .finally(() => {
            isDragEndProcessingRef.current = false;
          });
      }
    }

    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOverColumnId(null);
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
      const { active } = args;

      // Xác định loại item đang kéo dựa trên data
      const isCard = active?.data?.current?.type === "CARD";

      // Kéo column - dùng pointerWithin để lấy column chính xác
      if (!isCard) {
        // Thử pointerWithin trước (chính xác hơn)
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
          return pointerCollisions;
        }

        // Nếu không có pointerWithin collision, dùng closestCorners
        return closestCorners(args);
      }

      // Kéo card
      const pointerIntersections = pointerWithin(args);

      if (!pointerIntersections.length) {
        return lastOverId.current ? [{ id: lastOverId.current }] : [];
      }

      // Lấy collision đầu tiên từ pointerWithin
      let overId = getFirstCollision(pointerIntersections, "id");

      if (overId) {
        // Kiểm tra xem overId có phải là card không
        const overCard = orderedColumns
          .flatMap((col) => col.cards)
          .find((card) => card._id === overId);

        if (overCard) {
          lastOverId.current = overId;
          return [{ id: overId }];
        }

        // Nếu overId là column, tìm card đầu tiên trong column đó
        const overColumn = orderedColumns.find((col) => col._id === overId);
        if (overColumn) {
          const firstCardId = overColumn.cards?.[0]?._id;
          if (firstCardId) {
            lastOverId.current = firstCardId;
            return [{ id: firstCardId }];
          }
        }
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [orderedColumns],
  );

  /* ====================== RENDER ====================== */
  useEffect(() => {
    console.log("✅ DndContext is mounted and ready");
    console.log("✅ Sensors configured:", sensors.length, "sensors");

    // Expose copy logs function to window for debugging
    window.copyLogs = () => {
      const logs = document.querySelectorAll('div[role="log"]');
      let allText = "";
      logs.forEach((log) => {
        allText += log.innerText + "\n";
      });
      navigator.clipboard.writeText(allText);
      console.log("✅ Logs copied to clipboard!");
    };
  }, []);

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
            transition: activeDragItemType
              ? "none"
              : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: activeDragItemType ? 0.95 : 1,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: activeDragItemType
                ? `linear-gradient(135deg,
                    rgba(25, 118, 210, 0.1) 0%,
                    rgba(25, 118, 210, 0.05) 50%,
                    transparent 100%)`
                : "none",
              pointerEvents: "none",
              opacity: activeDragItemType ? 0.5 : 0,
              transition: "opacity 0.2s ease",
            },
          }}
        >
          <ListColumn
            columns={orderedColumns}
            isLoading={loading}
            overColumnId={overColumnId}
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
              duration: 250,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: 1,
                    boxShadow:
                      "0 20px 50px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3)",
                    transform: "scale(1.08) rotate(5deg)",
                  },
                },
              }),
            }}
          >
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
              <Column column={activeDragItemData} />
            )}
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
              <CardOverlay card={activeDragItemData} />
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

      {/* Loading Overlay */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(2px)",
        }}
        open={loading}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress color="inherit" size={50} />
          <Typography sx={{ color: "white", fontWeight: 500 }}>
            Loading...
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
}

export default BoardContent;
