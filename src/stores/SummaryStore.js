import {flow, makeAutoObservable} from "mobx";
import {searchStore} from "@/stores/index.js";

// Store for managing clip generated summaries
class SummaryStore {
  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  GetSummaryUrl = flow(function * ({objectId, startTime, endTime}) {
    try {
      const queryParams = {
        start_time: startTime,
        end_time: endTime,
        tracks: "speech_to_text,object_detection,celebrity_detection"
      };

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "summarize",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://ai-03.contentfabric.io/summary/q/${objectId}`
        .concat(url.slice(_pos));

      return newUrl;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary URL", error);
    }
  });

  GetSummaryResults = flow(function * ({objectId, startTime, endTime}) {
    let url;
    try {
      url = yield this.GetSummaryUrl({
        objectId,
        startTime,
        endTime
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary URL", error);
    }

    try {
      const results = yield this.client.Request({url});

      const updatedClip = searchStore.UpdateSearchResult({
        objectId,
        keyValues: [
          {key: "_aiSummary", value: results?.summary},
          {key: "_aiHashtags", value: results?.hashtags},
          {key: "_aiTitle", value: results?._title},
          {key: "_aiLoadedSummary", value: true}
        ]
      });

      searchStore.SetSelectedSearchResult({
        result: updatedClip
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary results", error);
    }
  });
}

export default SummaryStore;
