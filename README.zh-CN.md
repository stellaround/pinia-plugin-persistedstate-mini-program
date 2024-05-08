<div align="center">
  <img alt="pinia-plugin-persistedstate-weapp logo" width="120" height="120" src="./logo.png">
  <h1>pinia-plugin-persistedstate-weapp</h1>
  <span><a href="./README.md">English</a> | 中文</span>
</div>

# 简介

主旨是为了填补在taro中使用pinia以及pinia-plugin-persistedstate来实现持久化的方案中无小程序实现的空白（目前仅支持微信小程序）。

## 快速开始

1.安装依赖

```sh
pnpm i @stellaround/pinia-plugin-persistedstate-weapp
```

2.将插件添加到 pinia 实例上

```typescript
import { createPinia } from "pinia";
import { createPersistedStateWeapp } from "@stellaround/pinia-plugin-persistedstate-weapp";

const pinia = createPinia();

store.use(createPersistedStateWeapp());
```

## 配置

该插件的默认配置如下:

- 使用 localStorage 进行存储
- store.$id 作为 storage 默认的 key
- 整个 state 默认将被持久化
  如何你不想使用默认的配置，那么你可以将一个对象传递给 Store 的 persist 属性来配置持久化。

```typescript
import { defineStore } from "pinia";

export const useStore = defineStore("main", {
  state: () => ({
    someState: "你好 pinia",
  }),
  persist: {
    // 在这里进行自定义配置
  },
});
```

### key

- **类型**：string
- **默认值**：store.$id
  Key 用于引用 storage 中的数据

```typescript
import { defineStore } from "pinia";
export const useUserStore = defineStore(
  "user",
  () => {
    const name = ref<string | null>();
    return {
      name,
    };
  },
  {
    persist: {
      key: "my-custom-key",
    },
  },
);
```

这个 Store 将被持久化存储在 `localStorage` 中的 `my-custom-key` key 中。

### paths

- **类型**：string[]
- **默认值**：undefined
  用于指定 state 中哪些数据需要被持久化。[] 表示不持久化任何状态，undefined 或 null 表示持久化整个 state。

```typescript
import { defineStore } from "pinia";
export const useUserStore = defineStore(
  "user",
  () => {
    const name = ref<string | null>();
    const age = ref<string | null>();
    return {
      name,
      age,
    };
  },
  {
    persist: {
      paths: ["name"],
    },
  },
);
```

## 全局持久化配置

在安装插件之后，你可以使用 `createPersistedStateWeapp` 来初始化插件。这些配置将会成为项目内所有 Store 的默认选项。

### 全局key配置

全局 key 配置接受传入 Store key 的函数，并返回一个新的 storage 密钥。

```typescript
import { createPinia } from "pinia";
import { createPersistedStateWeapp } from "@stellaround/pinia-plugin-persistedstate-weapp";

const pinia = createPinia();

pinia.use(
  createPersistedStateWeapp({
    key: (id) => `__persisted__${id}`,
  }),
);
```

```typescript
import { defineStore } from "pinia";
export const useUserStore = defineStore(
  "user",
  () => {
    const name = ref<string | null>();
    return {
      name,
    };
  },
  {
    persist: true,
  },
);
```

上述例子中，store 将保存在 `__persisted__user` key 下，而不是 `user` 下。<br>
当你需要在全局范围内对所有 Store key 添加前缀/后缀时，应考虑此选项。

## 启用所有 Store 默认持久化

该配置将会使所有 Store 持久化存储，且必须配置 `persist: false` 显式禁用持久化。

```typescript
import { createPinia } from "pinia";
import { createPersistedStateWeapp } from "@stellaround/pinia-plugin-persistedstate-weapp";

const pinia = createPinia();

pinia.use(
  createPersistedStateWeapp({
    auto: true,
  }),
);
```

```typescript
import { defineStore } from "pinia";
export const useUserStore = defineStore("user", () => {
  const name = ref<string | null>();
  return {
    name,
  };
});
```

上述例子中，store 将使用默认配置（或者已有的全局配置）进行持久化存储。

#### 提示

当你使用该配置后，你可以单独为一个 Store 设置是否持久化：

```typescript
import { defineStore } from "pinia";
export const useUserStore = defineStore(
  "user",
  () => {
    const name = ref<string | null>();
    return {
      name,
    };
  },
  {
    persist: false,
  },
);
```

## License

[Apache-2.0](./LICENSE)

Copyright (c) 2024-present [spectature](https://github.com/Spectature)
```
