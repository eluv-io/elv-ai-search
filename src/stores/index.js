import {flow, makeAutoObservable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient.js";
import TenantStore from "@/stores/TenantStore.js";
import SearchStore from "@/stores/SearchStore.js";
import UiStore from "@/stores/UiStore.js";
import VideoStore from "@/stores/VideoStore.js";
import SummaryStore from "@/stores/SummaryStore.js";
import MusicStore from "@/stores/MusicStore.js";

// Store for loading data on app load
class RootStore {
  client;
  loaded = false;
  tenantId;
  networkInfo;

  constructor() {
    makeAutoObservable(this);

    this.tenantStore = new TenantStore(this);
    this.searchStore = new SearchStore(this);
    this.uiStore = new UiStore(this);
    this.videoStore = new VideoStore(this);
    this.summaryStore = new SummaryStore(this);
    this.musicStore = new MusicStore(this);
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
      this.networkInfo = yield this.client.NetworkInfo();
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
export const uiStore = rootStore.uiStore;
export const videoStore = rootStore.videoStore;
export const summaryStore = rootStore.summaryStore;
export const musicStore = rootStore.musicStore;

if(import.meta.hot) {
  if (import.meta.hot.data.store) {
    // Restore state
    searchStore.currentSearch = import.meta.hot.data.store.currentSearch;
  }

  import.meta.hot.accept();

  import.meta.hot.dispose((data) => {
    // Save state
    data.store = {
      currentSearch: searchStore.currentSearch
    };
  });
}

window.rootStore = rootStore;
