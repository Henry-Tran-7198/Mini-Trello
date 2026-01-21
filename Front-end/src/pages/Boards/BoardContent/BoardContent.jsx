import Box from '@mui/material/Box';
import { useState, useEffect, useCallback, useRef } from 'react';
import ListColumn from './ListColumns/ListColumn';
import { mapOrder } from '~/utils/sorts';
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
    rectIntersection
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './ListColumns/Column/Column';
import Card from './ListColumns/Column/ListCards/Card/Card';
import { cloneDeep, isEmpty } from 'lodash';
import { generatePlaceholderCard } from '~/utils/formatters'

const ACTIVE_DRAG_ITEM_TYPE = {
    COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
    CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
    // Sensor(cảm ứng)
    // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });
    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } });

    const sensors = useSensors(mouseSensor, touchSensor);

    // Logic drag&drop
    const [orderedColumns, setOrderedColumns] = useState([]);

    // Cùng 1 thời điểm chỉ có 1 phần tử được kéo (column || card)
    const [activeDragItemId, setActiveDragItemId] = useState(null);
    const [activeDragItemType, setActiveDragItemType] = useState(null);
    const [activeDragItemData, setActiveDragItemData] = useState(null);
    const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null);

    // Điểm va chạm cuối cùng(thuật toán phát hiện va chạm)
    const lastOverId = useRef(null);

    useEffect(() => {
        setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'));
    }, [board])

    // Tìm Column theo CardId
    const findColumnByCardId = (cardId) => {
        // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOderIds
        //bởi vì bước handleDragOver chúng ta sẽ làm dữ liệu cho card hoàn chỉnh
        //rồi mới tạo ra cardOderIds mới 
        return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId));
    }

    // Function chung xử lý update lại state trong case di chuyển card giữa 2 columns khac nhau
    const moveCardBetweenDifferenceColumn = (
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
    ) => {
        setOrderedColumns(prevColumns => {
            // Tìm vị trí(index) của cái overCard trong column đích (nơi activeCard sắp được thả)
            const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId);

            // Logic tính toán 'cardIndex mới' (trên hoặc dưới overCard)
            let newCardIndex;
            const isBelowOverItem = active.rect.current.translated &&
                active.rect.current.translated.top > over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.card?.length + 1;

            // Clone array OrderedColumnsState cũ ra 1 cái mới để xử lý data rồi return - update OrderedColumnsState mới
            const nextColumns = cloneDeep(prevColumns);
            const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id);
            const nextOverColumn = nextColumns.find(column => column._id === overColumn._id);

            // nextActiveColumn: column cũ
            if (nextActiveColumn) {
                // Xoá card ở column active (dùng filter để xoá card ra khỏi column cũ)
                nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId);

                // Thêm Placeholder card nếu column rỗng: bị kéo hết card không còn cái nào
                if (isEmpty(nextActiveColumn.cards)) {
                    console.log("The last card");
                    nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
                }

                // Update array cardOrderIds
                nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id);
            }

            // nextOverColumn: column mới
            if (nextOverColumn) {
                // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xoá nó trước
                nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId);
                // Tiếp theo la thêm card đang kéo vào overColumn theo vị trí index mới
                nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData);

                // Xoá cái placeholder card đi nếu nó đang tồn tại
                nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard);

                // Update array cardOrderIds
                nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id);
            }
            console.log('nextColumns: ', nextColumns);
            return nextColumns;
        })
    }

    // Trigger khi bắt đầu kéo 1 phần tử
    const handleDragStart = (event) => {
        setActiveDragItemId(event?.active?.id);
        setActiveDragItemType(event?.active?.data?.current?.columnId ?
            ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN);
        setActiveDragItemData(event?.active?.data?.current);

        // Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
        if (event?.active?.data?.current?.columnId) {
            setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
        }
    }

    // Trigger trong quá trình kéo 1 phần tử
    const handleDragOver = (event) => {
        // Không làm gì nếu đang kéo thả column
        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

        // console.log('handleDragOver: ', event);

        // Còn nếu kéo card xử lý thêm để kéo card qua lai giữa các columns
        const { active, over } = event;

        // Cần đảm bảo nếu không tồn tại active hoặc over(khi kéo ra khỏi phạm vi container) thì không làm gì 
        // (tránh crash trang)
        if (!active || !over) return;

        // activeDraggingCard: card đang được kéo 
        const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active;
        // overCard: là card đang tương tác trên hoặc dưới so với card đang được kéo ở trên
        const { id: overCardId } = over;

        // Tìm 2 columns theo cardId
        const activeColumn = findColumnByCardId(activeDraggingCardId);
        const overColumn = findColumnByCardId(overCardId);

        if (!activeColumn || !overColumn) return;

        // Xử lý logic ở đây khi 2 columns khac nhau, còn nếu kéo card trong cùng column thì không làm gì
        // Vì đây đang là đoạn xử lý lúc kéo(handleDragOver), còn xử lý lúc kéo xong thì vấn đề ở (handleDragEnd)
        if (activeColumn._id !== overColumn._id) {
            moveCardBetweenDifferenceColumn(
                overColumn,
                overCardId,
                active,
                over,
                activeColumn,
                activeDraggingCardId,
                activeDraggingCardData
            )
        }

    }

    // Trigger khi kết thúc hành động kéo 1 phần tử
    const handleDragEnd = (event) => {
        // console.log('handleDragEnd: ', event);
        const { active, over } = event;

        // Cần đảm bảo nếu không tồn tại active hoặc over(khi kéo ra khỏi phạm vị container) thì không làm gì 
        // (tránh crash trang)
        if (!active || !over) return;

        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
            // activeDraggingCard: card đang được kéo 
            const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active;
            // overCard: là card đang tương tác trên hoặc dưới so với card đang được kéo ở trên
            const { id: overCardId } = over;

            // Tìm 2 columns theo cardId
            const activeColumn = findColumnByCardId(activeDraggingCardId);
            const overColumn = findColumnByCardId(overCardId);

            if (!activeColumn || !overColumn) return;

            // Hành động kéo thả card giữa 2 column khác nhau: 
            // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id
            //(set vào state từ bước handleDragStart) chứ không phải activeData trong scope
            //handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị 
            //update 1 lần rồi.
            if (oldColumnWhenDraggingCard._id !== overColumn._id) {
                moveCardBetweenDifferenceColumn(
                    overColumn,
                    overCardId,
                    active,
                    over,
                    activeColumn,
                    activeDraggingCardId,
                    activeDraggingCardData
                )
            } else {
                // Hành động kéo thả card trong cùng 1 column
                // Get old position of column(from oldColumnDraggingCard)
                const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId);
                // Get new position of column(from overColumn)
                const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId);

                // Dùng arrayMove vì kéo card trong 1 column === kéo column trong board content
                const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex);

                setOrderedColumns(prevColumns => {
                    // Clone array OrderedColumnsState cũ ra 1 cái mới để xử lý data rồi return - update OrderedColumnsState mới
                    const nextColumns = cloneDeep(prevColumns);

                    // Tìm tới column mà chúng ta đang thả
                    const targetColumn = nextColumns.find(column => column._id === overColumn._id);

                    // Update lại 2 giá trị mới của card và cardOrderIds trong targetColumn
                    targetColumn.cards = dndOrderedCards;
                    targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id);

                    // Trả về value state mới (chuẩn vị trí)
                    return nextColumns;
                })
            }
        }

        // Xử lý kéo thả columns
        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
            // If old position !== new position
            if (active.id !== over.id) {
                // Get old position of column(from active)
                const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id);
                // Get new position of column(from over)
                const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id);

                // Dùng arrayMove dnd-kit để sắp xếp array column ban đầu
                const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex);
                // Get API: 
                // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id);
                // console.log('dndOrderedColumns: ', dndOrderedColumns);
                // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds);

                setOrderedColumns(dndOrderedColumns);
            }
        }

        setActiveDragItemId(null);
        setActiveDragItemType(null);
        setActiveDragItemData(null);
        setOldColumnWhenDraggingCard(null);
    }

    const customDropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    // args = arguments = các đối số, tham số
    const collisionDetectionStrategy = useCallback((args) => {
        // Case kéo column thì dùng thuật toán closestCorners
        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
            return closestCorners({ ...args });
        }
        // Tìm các điểm giao nhau, va chạm - intersection với con trỏ
        const pointerIntersections = pointerWithin(args);

        if (!pointerIntersections?.length) return;

        // Tìm overId đầu tiên trong đám pointerIntersections ở trên
        let overId = getFirstCollision(pointerIntersections, 'id');

        if (overId) {
            const checkColumn = orderedColumns.find(column => column._id === overId);

            lastOverId.current = overId;
            return [{ id: overId }];
        }
        if (checkColumn) {
            overId = closestCorners({
                ...args,
                droppableContainers: args.droppableContainers.filter(container => {
                    return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
                })
            })[0]?.id
        }

        //Nếu overId là null thì return [] - tránh bug crash trang
        return lastOverId.current ? [{ id: lastOverId.current }] : [];
    }, [activeDragItemType, orderedColumns]);


    // Logic drag&drop

    return (
        <DndContext
            sensors={sensors}
            // Collision detection algorithms
            // collisionDetection={closestCorners}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
                width: '100%',
                height: (theme) => theme.trello.boardContentHeight,
                p: '10px 0'
            }}>
                <ListColumn columns={orderedColumns} />
                <DragOverlay dropAnimation={customDropAnimation}>
                    {(!activeDragItemType) && null}
                    {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
                    {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
                </DragOverlay>
            </Box>
        </DndContext>
    )

}


export default BoardContent