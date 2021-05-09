import { screen } from 'electron'

export function isValidPosition(position: [number, number]) {
  const displays = screen.getAllDisplays()
  const [x, y] = position

  return displays.some(({ workArea }) => {
    return (
      x >= workArea.x &&
      x <= workArea.x + workArea.width &&
      y >= workArea.y &&
      y <= workArea.y + workArea.height
    )
  })
}
