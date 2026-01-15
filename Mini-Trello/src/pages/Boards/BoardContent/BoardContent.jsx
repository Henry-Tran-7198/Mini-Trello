import { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

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
  getFirstCollision
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

// Components
import ListColumn from './ListColumns/ListColumn'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

// Utils
import { mapOrder } from '~/utils/sorts'
import { generatePlaceholderCard } from '~/utils/formatters'
import { cloneDeep, isEmpty } from 'lodash'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'COLUMN',
  CARD: 'CARD'
}

function BoardContent({ board }) {
  const theme = useTheme()

  /* ====================== SENSOR ====================== */
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })
  const sensors = useSensors(mouseSensor, touchSensor)

  /* ====================== STATE ====================== */
  const [orderedColumns, setOrderedColumns] = useState([])
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  const lastOverId = useRef(null)

  useEffect(() => {
    if (board?.columns) {
      setOrderedColumns(mapOrder(board.columns, board.columnOrderIds, '_id'))
    }
  }, [board])

  /* ====================== HELPERS ====================== */
  const findColumnByCardId = (cardId) =>
    orderedColumns.find(col => col.cards?.some(card => card._id === cardId))

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeCardId,
    activeCardData
  ) => {
    setOrderedColumns(prev => {
      const nextColumns = cloneDeep(prev)

      const nextActiveColumn = nextColumns.find(c => c._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(c => c._id === overColumn._id)

      if (!nextActiveColumn || !nextOverColumn) return prev

      // Remove card from old column
      nextActiveColumn.cards = nextActiveColumn.cards.filter(c => c._id !== activeCardId)

      if (isEmpty(nextActiveColumn.cards)) {
        nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
      }

      nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(c => c._id)

      // Insert into new column
      const overIndex = nextOverColumn.cards.findIndex(c => c._id === overCardId)
      const isBelow = active.rect.current.translated.top > over.rect.top + over.rect.height
      const newIndex = overIndex >= 0 ? overIndex + (isBelow ? 1 : 0) : nextOverColumn.cards.length

      nextOverColumn.cards = nextOverColumn.cards
        .filter(c => !c.FE_PlaceholderCard && c._id !== activeCardId)
        .toSpliced(newIndex, 0, activeCardData)

      nextOverColumn.cardOrderIds = nextOverColumn.cards.map(c => c._id)

      return nextColumns
    })
  }

  /* ====================== EVENTS ====================== */
  const handleDragStart = ({ active }) => {
    setActiveDragItemData(active.data.current)

    const isCard = !!active.data.current?.columnId
    setActiveDragItemType(isCard ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)

    if (isCard) {
      setOldColumnWhenDraggingCard(findColumnByCardId(active.id))
    }
  }

  const handleDragOver = ({ active, over }) => {
    if (!active || !over || activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const activeCardId = active.id
    const overCardId = over.id

    const activeColumn = findColumnByCardId(activeCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn || activeColumn._id === overColumn._id) return

    moveCardBetweenDifferentColumns(
      overColumn,
      overCardId,
      active,
      over,
      activeColumn,
      activeCardId,
      active.data.current
    )
  }

  const handleDragEnd = ({ active, over }) => {
    if (!active || !over) return

    // CARD
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const activeColumn = findColumnByCardId(active.id)
      const overColumn = findColumnByCardId(over.id)

      if (!activeColumn || !overColumn) return

      if (oldColumnWhenDraggingCard._id === overColumn._id) {
        const oldIndex = oldColumnWhenDraggingCard.cards.findIndex(c => c._id === active.id)
        const newIndex = overColumn.cards.findIndex(c => c._id === over.id)

        const newCards = arrayMove(overColumn.cards, oldIndex, newIndex)

        setOrderedColumns(prev => {
          const next = cloneDeep(prev)
          const target = next.find(c => c._id === overColumn._id)
          target.cards = newCards
          target.cardOrderIds = newCards.map(c => c._id)
          return next
        })
      }
    }

    // COLUMN
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && active.id !== over.id) {
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      setOrderedColumns(arrayMove(orderedColumns, oldIndex, newIndex))
    }

    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  /* ====================== COLLISION ====================== */
  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners(args)
    }

    const pointerIntersections = pointerWithin(args)
    if (!pointerIntersections.length) {
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    }

    const overId = getFirstCollision(pointerIntersections, 'id')
    lastOverId.current = overId
    return [{ id: overId }]
  }, [activeDragItemType])

  /* ====================== RENDER ====================== */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          width: '100%',
          height: theme.trello.boardContentHeight,
          bgcolor: theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          p: '10px 0'
        }}
      >
        <ListColumn columns={orderedColumns} />

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: 0.5 } }
            })
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
  )
}

export default BoardContent
