import Box from '@mui/material/Box';
import React from 'react';
import Column from './Column/Column';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Button from '@mui/material/Button';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';

function ListColumn({ columns }) {
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
    const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    const addNewColumn = () => {
        if (!newColumnTitle) {
            console.error('Please enter Column title!!');
            return;
        }
        // console.log(newColumnTitle);
        // Call API
        toggleOpenNewColumnForm();
        setNewColumnTitle('');
    }

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
                {!openNewColumnForm
                    ? <Box onClick={toggleOpenNewColumnForm} sx={{
                        minWidth: '250px',
                        maxWidth: '250px',
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
                    : <Box sx={{
                        minWidth: '250px',
                        maxWidth: '250px',
                        mx: 2,
                        p: 1,
                        borderRadius: '6px',
                        height: 'fit-content',
                        bgcolor: '#ffffff3d',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}>
                        <TextField
                            label="Enter column title..."
                            type="text"
                            size="small"
                            variant='outlined'
                            autoFocus
                            fullWidth
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            sx={{
                                '& label': { color: 'white' },
                                '& input': { color: 'white' },
                                '& label.Mui-focused': { color: 'white' },
                                '& .MuiOutlinedInput-root': {
                                    "& fieldset": {
                                        borderColor: 'white'
                                    },
                                    "&:hover fieldset": {
                                        borderColor: 'white'
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: 'white'
                                    },
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                onClick={addNewColumn}
                                variant='contained' color='success' size='samll'
                                sx={{
                                    boxShadow: 'none',
                                    border: '0.5 solid',
                                    borderColor: (theme) => theme.palette.success.main,
                                    '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                                }}
                            >
                                Add Column
                            </Button>
                            <CloseIcon
                                fontSize='small'
                                sx={{
                                    color: 'white',
                                    cursor: 'pointer',
                                    '&:hover': { color: (theme) => theme.palette.warning.light }
                                }}
                                onClick={toggleOpenNewColumnForm}
                            />
                        </Box>
                    </Box>
                }

            </Box>
        </SortableContext>
    )
}

export default ListColumn
