import {flow, makeAutoObservable} from "mobx";

// Store for managing clip generated highlights
class HighlightsStore {
  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  GetHighlightsUrl = flow(function * ({objectId, startTime, endTime}) {
    try {
      const queryParams = {
        start_time: startTime,
        end_time: endTime
      };

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "highlight",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://ai-03.contentfabric.io/highlight/q/${objectId}`
        .concat(url.slice(_pos));

      return newUrl;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get highlights URL", error);
    }
  });

  GetHighlightsResults = flow(function * ({objectId, startTime, endTime}) {
    let url;
    try {
      url = yield this.GetHighlightsUrl({
        objectId,
        startTime,
        endTime
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get highlights URL", error);
    }

    try {
      const response = yield this.client.Request({url});

      const results = yield Promise.all(
        (response?.highlight || []).map(async (item) => {
          const imageUrl = await this.rootStore.GetThumbnail({
            objectId,
            timeSecs: startTime / 1000
          });

          item["_imageSrc"] = imageUrl;
          return item;
        })
      );

      return results;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get highlights results", error);
    }
  });
}

export default HighlightsStore;
