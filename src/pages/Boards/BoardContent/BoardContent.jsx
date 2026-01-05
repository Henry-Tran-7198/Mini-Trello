import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';
import ListColumn from './ListColumns/ListColumn';
import { mapOrder } from '~/utils/sorts';
import { DndContext, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

function BoardContent({ board }) {
    // Sensor(cảm ứng)
    // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });
    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } });

    const sensors = useSensors(mouseSensor, touchSensor);

    // Logic drag&drop
    const [orderedColumns, setOrderedColumns] = useState([]);

    useEffect(() => {
        setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'));
    }, [board])

    const handleDragEnd = (event) => {
        console.log('handleDragEnd: ', event);
        const { active, over } = event;

        // Check if over does not exist, then return immediately
        if (!over) return;

        // If old position !== new position
        if (active.id !== over.id) {
            // Get old position of column(from active)
            const oldIndex = orderedColumns.findIndex(c => c._id === active.id);
            // Get new position of column(from over)
            const newIndex = orderedColumns.findIndex(c => c._id === over.id);

            // Dùng arrayMove dnd-kit để sắp xếp array column ban đầu
            const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex);
            // Get API: 
            // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id);
            // console.log('dndOrderedColumns: ', dndOrderedColumns);
            // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds);

            setOrderedColumns(dndOrderedColumns);
        }
    }
    // Logic drag&drop

    return (
        <DndContext onDragEnd={handleDragEnd} sensor={sensors}>
            <Box sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
                width: '100%',
                height: (theme) => theme.trello.boardContentHeight,
                p: '10px 0'
            }}>
                <ListColumn columns={orderedColumns} />
            </Box>
        </DndContext>
    )
}

export default BoardContent