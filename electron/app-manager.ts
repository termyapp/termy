import { Window } from './window'

export type ManagerTypes = Window

class AppManager {
  private windowManager: Map<string, ManagerTypes> = new Map()

  setWindow(name: string, element: ManagerTypes): void {
    this.windowManager.set(name, element)
  }

  getWindow(name: string): ManagerTypes {
    const element = this.windowManager.get(name)
    if (element) {
      return element
    }
    throw new Error(`[AppManager] - Element with name ${name} doesn't exist!`)
  }

  deleteWindow(name: string): void {
    this.windowManager.delete(name)
  }
}

export const appManager = new AppManager()
