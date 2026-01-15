/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Board Page (Main)
 */

import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

export default function Board({ board }) {
  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* App Bar */}
      <AppBar />

      {/* Board Bar */}
      <BoardBar board={board} />

      {/* Board Content */}
      <BoardContent board={board} />
    </Container>
  )
}
