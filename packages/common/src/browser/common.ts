//
// Browser apis that can be used in a mobile web view as well as the extension.
//
export class BrowserRuntimeCommon {
  public static sendMessageToBackground(msg: any, cb?: any) {
    return BrowserRuntimeCommon.sendMessageToAnywhere(msg, cb);
  }

  public static sendMessageToAppUi(msg: any, cb?: any) {
    return BrowserRuntimeCommon.sendMessageToAnywhere(msg, cb);
  }

  public static sendMessageToAnywhere(msg: any, cb?: any) {
    chrome
      ? chrome.runtime.sendMessage(msg, cb)
      : browser.runtime.sendMessage(msg).then(cb);
  }

  public static addEventListenerFromBackground(listener: any): void {
    return BrowserRuntimeCommon.addEventListenerFromAnywhere(listener);
  }

  public static addEventListenerFromAppUi(listener: any): void {
    return BrowserRuntimeCommon.addEventListenerFromAnywhere(listener);
  }

  public static addEventListenerFromAnywhere(listener: any): void {
    return chrome
      ? chrome.runtime.onMessage.addListener(listener)
      : browser.runtime.onMessage.addListener(listener);
  }

  public static async getLocalStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // TODO: add `browser` support
      return chrome?.storage.local.get(key, (result) => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  public static async setLocalStorage(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const obj: any = {};
      obj[key] = value;
      // TODO: add `browser` support
      chrome?.storage.local.set(obj, () => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static async clearLocalStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome?.storage.local.clear(() => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static checkForError() {
    const { lastError } = chrome ? chrome.runtime : browser.runtime;
    return lastError ? new Error(lastError.message) : undefined;
  }
}
