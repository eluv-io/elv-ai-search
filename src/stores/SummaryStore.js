import {flow, makeAutoObservable} from "mobx";

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
    const queryParams = {
      start_time: startTime,
      end_time: endTime
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
      return this.client.Request({url});
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary results", error);
    }
  });
}

export default SummaryStore;
