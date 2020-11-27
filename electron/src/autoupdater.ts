import { autoUpdater, UpdateCheckResult } from 'electron-updater'
import { dialog } from 'electron'
interface UpdaterOptions {
  /**
   * Decide whetever to check for updates when the app starts
   * and the did-finish-load event is fired
   */
  checkForUpdatesOnAppInitialization: boolean;
    /**
   * Decide whetever to check for updates when you quit the app
   */
  checkForUpdatesOnAppQuit: boolean;
  /**
   * Channel to fetch from updates.
   * In GitHub, releases must be prefixed with beta- or stable-
   */
  channel: 'stable' | 'beta' | 'none';
  /**
   * URL to fetch from updates. Only GitHub Releases is accepted right now
   * @type string
   */
  _url: string;
}

function initUpdater(options: UpdaterOptions) {
  // Init settings
  // This function should be triggered before 'check for updates' is called,
  // but you can call it whenever you want as well
  autoUpdater.autoInstallOnAppQuit = options.checkForUpdatesOnAppQuit
  autoUpdater.channel = options.channel
}

function checkForUpdates() {
  const update = autoUpdater.checkForUpdates() // checkForUpdates returns a Promise
  update.then((value: UpdateCheckResult) => {
    // If there is an update
    value.downloadPromise?.then((reason) => {
      console.log(reason) // For debugging reasons. Remove when this is ready
    })
    // If there isn't an update
    value.downloadPromise?.catch((reason: any) => {
      dialog.showMessageBox({
        title: 'Up-to-date',
        message: 'There are no updates available right now.',
        detail: reason.toString(), // Convert error message to string just in case
        buttons: ['OK']
      })
    })
  })
  update.catch((reason: any) => {
    // Notify errors to the users
    // so they can report them and be fixed.
    // This could change if Termy has any kind of
    // cloud on which errors are reported.
    // You can read more here: https://www.electronjs.org/docs/api/crash-reporter
    // https://stackoverflow.com/questions/50686010/custom-error-window-handling-in-electron
    throw new Error(reason)
  })
}

export default { checkForUpdates, initUpdater }
