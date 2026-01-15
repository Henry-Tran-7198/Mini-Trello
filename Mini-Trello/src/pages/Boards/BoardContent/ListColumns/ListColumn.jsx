import Box from '@mui/material/Box';
import Column from './Column/Column';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Button from '@mui/material/Button';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';


function ListColumn({ columns }) {
    // SortableContext yêu cầu items là 1 array dạng['id-1', 'id-2'] chứ không phải [{ id: 'id-1' }, { id: 'id-2' }]
    // Nếu không đúng thì vẫn kéo thả được nhưng không animation
    return (
        <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
            <Box sx={{
                bgcolor: 'inherit',
                width: '100%',
                height: '100%',
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                '&::-webkit-scrollbar-track': { m: 2 }
            }}>
                {columns?.map(column => (<Column key={column._id} column={column} />))}

                {/* Box Add New Column CTA */}
                <Box sx={{
                    minWidth: '200px',
                    maxWidth: '200px',
                    mx: 2,
                    borderRadius: '6px',
                    height: 'fit-content',
                    bgcolor: '#ffffff3d'
                }}>
                    <Button startIcon={<NoteAddIcon />}
                        sx={{
                            color: 'white',
                            width: '100%',
                            justifyItems: 'flex-start',
                            pl: 2.5,
                            py: 1
                        }} >
                        Add new column
                    </Button>
                </Box>
            </Box>
        </SortableContext>
    )
}

export default ListColumn
