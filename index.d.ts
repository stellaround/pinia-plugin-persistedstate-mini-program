import type { PiniaPlugin } from "pinia";
interface FactoryOptions {
    key?: (key: string) => string;
    auto?: boolean;
}
export declare function createPersistedStateWeapp(factoryOptions?: FactoryOptions): PiniaPlugin;
export {};
