import Container from '@mui/material/Container';
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import { mockData } from '~/api/mock-data'


function Board() {
    return (
        <Container disableGutters maxWidth={false} sx={{ height: '100vh', backgroundColor: 'primary.main' }}>
            <AppBar />
            <BoardBar board />
            <BoardContent board />
        </Container>
    )
}

export default Board
