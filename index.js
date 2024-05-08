const isWechatMiniProgram = typeof wx !== "undefined";

const isObjectOrBoolean = (value) => {
  if (value === null || value === undefined) return "undefined";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "boolean";
};

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const dealDataUpdate = (store, storageKey, properties) => {
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
  const updateStorage = debounce((convertState) => {
    try {
      wx.setStorageSync(storageKey, convertState);
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, 500); // 假设500毫秒内多次变更只存储一次

  // 监听store的变化，更新存储的状态
  store.$subscribe(
    (mutation, state) => {
      let convertState;
      if (properties) {
        convertState = properties.reduce((acc, property) => {
          // 考虑属性是嵌套对象的情况
          if (property.includes(".")) {
            const keys = property.split(".");
            const lastKey = keys.pop();
            let nestedObj = state;
            keys.forEach((key) => {
              nestedObj = nestedObj[key];
            });
            acc[property] = nestedObj[lastKey];
          } else {
            acc[property] = state[property];
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

export function createPersistedStateWeapp(factoryOptions = {}) {
  return (context) => {
    if (!isWechatMiniProgram) return;
    const { options, store } = context;
    const { key, auto: globalPersist } = factoryOptions;

    let storageKey;

    switch (isObjectOrBoolean(options.persist)) {
      case "object":
        // eslint-disable-next-line no-case-declarations
        const { paths: persistedProps, key: storeKey } = options.persist;
        storageKey = key ? key(storeKey || store.$id) : storeKey || store.$id;
        if (persistedProps) {
          dealDataUpdate(store, storageKey, persistedProps);
        } else {
          dealDataUpdate(store, storageKey);
        }
        break;
      case "boolean":
        if (!options.persist) return;
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
