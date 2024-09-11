import {flow, makeAutoObservable} from "mobx";
import {searchStore} from "@/stores/index.js";

// Store for managing clip generated summaries
class SummaryStore {
  loadingSummary = false;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  ToggleLoading = () => {
    this.loadingSummary = !this.loadingSummary;
  };

  GetSummaryUrl = flow(function * ({objectId, startTime, endTime, cache=true}) {
    try {
      const queryParams = {
        start_time: startTime,
        end_time: endTime,
        tracks: "speech_to_text,object_detection,celebrity_detection"
      };

      if(!cache) {
        queryParams["regenerate"] = true;
      }

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "summarize",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://ai-03.contentfabric.io/mlcache/summary/q/${objectId}`
        .concat(url.slice(_pos));

      return newUrl;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary URL", error);
    }
  });

  GetSummaryResults = flow(function * ({objectId, startTime, endTime, cache=true}) {
    let url;
    try {
      this.ToggleLoading();
      url = yield this.GetSummaryUrl({
        objectId,
        startTime,
        endTime,
        cache
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary URL", error);
      this.ToggleLoading();
    }

    try {
      const results = yield this.client.Request({url});

      searchStore.UpdateSelectedSearchResult({
        key: "_summary",
        value: results
      });

      this.ToggleLoading();

      return results;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary results", error);
      this.ToggleLoading();
    }
  });
}

export default SummaryStore;
