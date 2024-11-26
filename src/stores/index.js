import {flow, makeAutoObservable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient.js";
import TenantStore from "@/stores/TenantStore.js";
import SearchStore from "@/stores/SearchStore.js";
import UiStore from "@/stores/UiStore.js";
import VideoStore from "@/stores/VideoStore.js";
import SummaryStore from "@/stores/SummaryStore.js";
import HighlightsStore from "@/stores/HighlightsStore.js";
import RatingStore from "@/stores/RatingStore.js";

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
    this.highlightsStore = new HighlightsStore(this);
    this.ratingStore = new RatingStore(this);
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

  GetThumbnail = flow(function * ({
    objectId,
    timeSecs=0,
    queryParams={}
  }) {
    try {
      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "frame/default/video",
        channelAuth: true,
        queryParams: {
          t: timeSecs,
          max_offset: 60,
          ignore_trimming: true,
          resolve: true,
          ...queryParams
        }
      });

      return url;
    } catch(error) {

      console.error(`Unable to generate thumbnail url for ${objectId}`, error);
    }
  });

  GetFilePath = flow(function * ({
    libraryId,
    objectId,
    path,
    queryParams={}
  }){
    if(!libraryId) {
      libraryId = yield this.client.ContentObjectLibraryId({objectId});
    }

    return this.client.FileUrl({
      libraryId,
      objectId,
      filePath: path,
      queryParams
    });
  });

  GetDownloadUrlWithMaxResolution = flow (function * ({
    libraryId,
    objectId,
    startTime,
    endTime
  }) {
    const clip_start = startTime / 1000;
    const clip_end = endTime / 1000;

    const offerings = yield this.client.ContentObjectMetadata({
      objectId,
      libraryId,
      metadataSubtree: "offerings",
    });

    const offering = offerings["default"];
    const representations = offering.playout.streams.video.representations;
    let playoutKey = null;
    let maxHeight = 0;
    let maxWidth;

    for(let key in representations) {
      const playout = offering.playout.streams.video.representations[key];
      if (playout.height > maxHeight) {
        playoutKey = key;
        maxHeight = playout.height;
        maxWidth = playout.width;
      }
    }
    const title_name = yield this.client.ContentObjectMetadata({
      objectId,
      libraryId,
      metadataSubtree: "public/name",
    });

    const token = yield this.client.CreateSignedToken({
      objectId,
      duration: 24 * 60 * 60 * 1000,
    });

    const FormatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secondsLeft = Math.floor(seconds % 60);

      const paddedHours = String(hours).padStart(2, "0");
      const paddedMinutes = String(minutes).padStart(2, "0");
      const paddedSeconds = String(secondsLeft).padStart(2, "0");

      return `${paddedHours}-${paddedMinutes}-${paddedSeconds}`;
    };

    let formattedClipStart = FormatTime(clip_start);
    let formattedClipEnd = FormatTime(clip_end);

    const filename = `Title - ${title_name} (${maxWidth}x${maxHeight}) (${formattedClipStart} - ${formattedClipEnd}).mp4`;

    const url = yield this.client.Rep({
      objectId,
      libraryId,
      rep: `media_download/default/${playoutKey}`,
      noAuth: true,
      queryParams: {
        clip_start,
        clip_end,
        authorization: token,
        "header-x_set_content_disposition": `attachment;filename=${filename}`,
      },
    });

    return url;
  });
}

export const rootStore = new RootStore();
export const tenantStore = rootStore.tenantStore;
export const searchStore = rootStore.searchStore;
export const uiStore = rootStore.uiStore;
export const videoStore = rootStore.videoStore;
export const summaryStore = rootStore.summaryStore;
export const highlightsStore = rootStore.highlightsStore;
export const ratingStore = rootStore.ratingStore;

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
