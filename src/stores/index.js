import {flow, makeAutoObservable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient.js";
import TenantStore from "@/stores/TenantStore.js";
import SearchStore from "@/stores/SearchStore.js";

// Store for loading data on app load
class RootStore {
  client;
  loaded = false;
  tenantId;

  constructor() {
    makeAutoObservable(this);

    this.tenantStore = new TenantStore(this);
    this.searchStore = new SearchStore(this);
    this.Initialize();
  }

  Initialize = flow(function * () {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 240
      });

      window.client = this.client;

      this.tenantId = yield this.tenantStore.GetTenantData();
    } catch(error) {
      /* eslint-disable no-console */
      console.error("Failed to initialize application");
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });
}

export const rootStore = new RootStore();
export const tenantStore = rootStore.tenantStore;
export const searchStore = rootStore.searchStore;

window.rootStore = rootStore;
