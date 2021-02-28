// import { BrowserWindow } from 'electron'
// import Config from 'electron-store'

// const defaults = {
//   windowPosition: [50, 50],
//   windowSize: [540, 380],
// }

// // local storage
// const cfg = new Config({ defaults })

// export default {
//   defaults,
//   get() {
//     const position = cfg.get('windowPosition', defaults.windowPosition)
//     const size = cfg.get('windowSize', defaults.windowSize)
//     return { position, size }
//   },
//   recordState(win: BrowserWindow) {
//     cfg.set('windowPosition', win.getPosition())
//     cfg.set('windowSize', win.getSize())
//   },
// }

// export function positionIsValid(position: [number, number]) {
//   const displays = electron.screen.getAllDisplays()
//   const [x, y] = position

//   return displays.some(({ workArea }) => {
//     return (
//       x >= workArea.x &&
//       x <= workArea.x + workArea.width &&
//       y >= workArea.y &&
//       y <= workArea.y + workArea.height
//     )
//   })
// }

{
}
