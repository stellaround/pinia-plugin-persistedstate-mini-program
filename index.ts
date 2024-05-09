import type { PiniaPlugin, PiniaPluginContext, StateTree, Store } from "pinia";

interface FactoryOptions {
  key?: (key: string) => string;
  auto?: boolean;
}

interface persistOptions {
  key?: string;
  paths?: string[];
}

interface contextOptions {
  persist?: boolean | persistOptions;
}

const isWechatMiniProgram = typeof wx !== "undefined";

const isObjectOrBoolean = (value: any) => {
  if (value === null || value === undefined) return "undefined";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "boolean";
};

const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number,
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<F>) {
    // @ts-ignore
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const dealDataUpdate = (
  store: Store,
  storageKey: string,
  properties?: string[],
) => {
  // 加载存储的状态
  try {
    const persistedState = wx.getStorageSync(storageKey);
    if (persistedState) {
      store.$patch(persistedState);
    }
  } catch (e) {
    console.error("Failed to retrieve persisted state:", e);
  }

  // 使用防抖函数优化频繁的存储操作
  const updateStorage = debounce((convertState: StateTree) => {
    try {
      wx.setStorageSync(storageKey, convertState);
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, 500); // 假设500毫秒内多次变更只存储一次

  // 监听store的变化，更新存储的状态
  store.$subscribe(
    (mutation, state) => {
      let convertState: StateTree;
      if (properties) {
        convertState = properties.reduce((acc: any, property) => {
          // 考虑属性是嵌套对象的情况
          if (property.includes(".")) {
            const keys = property.split(".");
            const lastKey = keys.pop();
            let nestedObj: any = state;
            keys.forEach((key) => {
              nestedObj = nestedObj[key];
            });
            acc[property] = nestedObj[lastKey as string];
          } else {
            acc[property] = (state as any)[property];
          }
          return acc;
        }, {});
      } else {
        convertState = state;
      }
      updateStorage(convertState);
    },
    { detached: true },
  );
};

export function createPersistedStateWeapp(
  factoryOptions: FactoryOptions = {},
): PiniaPlugin {
  return (context: PiniaPluginContext) => {
    if (!isWechatMiniProgram) return;
    const { options, store } = context;
    const { key, auto: globalPersist } = factoryOptions;

    let storageKey: string;

    switch (isObjectOrBoolean((options as contextOptions).persist)) {
      case "object":
        // eslint-disable-next-line no-case-declarations
        const { paths: persistedProps, key: storeKey } = (
          options as contextOptions
        ).persist as persistOptions;
        storageKey = key ? key(storeKey || store.$id) : storeKey || store.$id;
        if (persistedProps) {
          dealDataUpdate(store, storageKey, persistedProps);
        } else {
          dealDataUpdate(store, storageKey);
        }
        break;
      case "boolean":
        if (!(options as contextOptions).persist) return;
        storageKey = key ? key(store.$id) : store.$id;
        dealDataUpdate(store, storageKey);
        break;
      case "undefined":
        if (!globalPersist) return;
        storageKey = key ? key(store.$id) : store.$id;
        dealDataUpdate(store, storageKey);
        break;
      default:
    }
  };
}
