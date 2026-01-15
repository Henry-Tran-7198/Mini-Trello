import Board from './Board'
import { mockData } from '~/api/mock-data'

export default function Boards() {
  return <Board board={mockData.board} />
}
