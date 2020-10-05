import { app, Tray, Menu, nativeImage } from 'electron'

export class TrayMenu {
  public readonly tray: Tray

  private iconPath: string = '/assets/icon.png'

  constructor() {
    this.tray = new Tray(this.createNativeImage())
    this.tray.setContextMenu(this.createMenu())
  }

  createNativeImage() {
    const path = `${app.getAppPath()}${this.iconPath}`
    const image = nativeImage.createFromPath(path)
    image.setTemplateImage(true)
    return image
  }

  createMenu(): Menu {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Termy',
        type: 'normal',
        click: () => {
          /* Later this will open the Main Window */
        },
      },
      {
        label: 'Quit',
        type: 'normal',
        click: () => app.quit(),
      },
    ])
    return contextMenu
  }
}
