import {flow, makeAutoObservable} from "mobx";

// Store for managing clip generated summaries
class SummaryStore {
  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  GetSummaryUrl = flow(function * ({objectId}) {
    const queryParams = {
      start_time: 100,
      end_time: 5000
    };

    const url = yield this.client.Rep({
      libraryId: yield this.client.ContentObjectLibraryId({objectId}),
      objectId,
      select: "/public/asset_metadata/title",
      rep: "search",
      service: "search",
      makeAccessRequest: true,
      queryParams: queryParams
    });

    const _pos = url.indexOf("/qlibs/");
    const newUrl = "https://ai-02.contentfabric.io/summary".concat(url.slice(_pos));

    console.log("url", newUrl)
  });

  GetSummaryResults = flow(function * () {});
}

export default SummaryStore;
