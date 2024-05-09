<div align="center">
  <img alt="pinia-plugin-persistedstate-mini-program logo" width="120" height="120" src="./logo.png">
  <h1>pinia-plugin-persistedstate-mini-program</h1>
  <span>English | <a href="./README.zh-CN.md">中文</a></span>
</div>

# Introduction

The main purpose is to fill in the gap in the Taro where there is no applet implementation in the persistence solution using Pinia and Pinia-plugin-persistedstate (currently only supports WeChat applets).

## Quick Start

1.Install dependencies

```sh
pnpm i @stellaround/pinia-plugin-persistedstate-mini-program
```

2.Add the plugin to the Pinia instance

```typescript
import { createPinia } from "pinia";
import { createPersistedStateWeapp } from "@stellaround/pinia-plugin-persistedstate-mini-program";

const pinia = createPinia();

store.use(createPersistedStateWeapp());
```

## Configuration

The default configuration for this plugin is as follows:

- Using localStorage for storage
- The store.$id is the default key for storage
- The entire state will be persisted by default
  If you do not want to use the default configuration, you can pass an object to the Store's `persist` property to configure persistence.

```typescript
import { defineStore } from "pinia";

export const useStore = defineStore("main", {
  state: () => ({
    someState: "Hello Pinia",
  }),
  persist: {
    // Custom configuration goes here
  },
});
```

### key

- **Type**: string
- **Default value**: store.$id
  Key is used to reference data in storage

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

This Store will be persisted in `localStorage` under the key `my-custom-key`.

### paths

- **Type**: string[]
- **Default value**：undefined
  Used to specify which parts of the state need to be persisted. [] means do not persist any state, undefined or null means persist the entire state.

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

## Global Persistence Configuration

After installing the plugin, you can use `createPersistedStateWeapp` to initialize the plugin. These configurations will become default options for all Stores in the project.

### Global key Configuration

The global key configuration accepts a function that takes in the Store key and returns a new storage key.

```typescript
import { createPinia } from "pinia";
import { createPersistedStateWeapp } from "@stellaround/pinia-plugin-persistedstate-mini-program";

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

In the above example, the store will be saved under the `__persisted__user` key, not under `user`.

When you need to add prefixes/suffixes to all Store keys at a global level, consider this option.

## Enable Default Persistence for All Stores

This configuration will make all Stores persistence storage, and `persist: false` must be configured to explicitly disable persistence.

```typescript
import { createPinia } from "pinia";
import { createPersistedStateWeapp } from "@stellaround/pinia-plugin-persistedstate-mini-program";

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
In the above example, the store will use the default configuration (or existing global configuration) for persistent storage.

## TIP

After using this configuration, you can set whether a Store is persistent or not individually:

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
