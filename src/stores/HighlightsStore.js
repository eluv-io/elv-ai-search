import {flow, makeAutoObservable} from "mobx";
import {searchStore} from "@/stores/index.js";

// Store for managing clip generated highlights
class HighlightsStore {
  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  GetHighlightsUrl = flow(function * ({objectId, startTime, endTime, cache=true}) {
    try {
      const queryParams = {
        start_time: startTime,
        end_time: endTime
      };

      if(!cache) {
        queryParams["regenerate"] = true;
      }

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "highlight",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://ai-03.contentfabric.io/mlcache/highlight/q/${objectId}`
        .concat(url.slice(_pos));

      return newUrl;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get highlights URL", error);
    }
  });

  GetHighlightsResults = flow(function * ({objectId, startTime, endTime, cache=true}) {
    let url;
    let retries = 0;
    try {
      url = yield this.GetHighlightsUrl({
        objectId,
        startTime,
        endTime,
        cache
      });
    } catch(error) {
      if(retries === 0) {
        url = yield this.GetHighlightsUrl({
          objectId,
          startTime,
          endTime,
          cache: false
        });

        retries = retries++;
      } else {
        // eslint-disable-next-line no-console
        console.error("Failed to get highlights URL", error);
      }
    }

    try {
      const response = yield this.client.Request({url});

      // Parse highlights if they are returned stringified
      // TODO: Remove this eventually
      if(typeof response?.highlight === "string") {
        try {
          response.highlight = JSON.parse(response.highlight);
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error("Unable to parse highlight response");
        }
      }

      const results = yield Promise.all(
        (Array.isArray(response?.highlight) ? response.highlight : []).map(async (item) => {
          const imageUrl = await this.rootStore.GetThumbnail({
            objectId,
            timeSecs: item.start_time / 1000
          });

          item["_imageSrc"] = imageUrl;
          return item;
        })
      );
      let keyframes;

      if(response.keyframe) {
        keyframes = yield Promise.all(
          (Array.isArray(response?.keyframe) ? response.keyframe : [response?.keyframe])
            .map(async (item) => {
              const imageUrl = await this.rootStore.GetThumbnail({
                objectId,
                timeSecs: item.start_time / 1000,
                queryParams: {
                  width: 100
                }
              });

              item["_imageSrc"] = imageUrl;

              return item;
            })
        );
      }

      searchStore.UpdateSelectedSearchResult({
        key: "_highlights",
        value: {results, keyframes}
      });

      return {
        results,
        keyframes
      };
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get highlights results", error);
    }
  });
}

export default HighlightsStore;
