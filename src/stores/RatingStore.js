import {flow, makeAutoObservable} from "mobx";

// Store for managing ratings of (search) results
class RatingStore {
  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  SetRatingResults = flow(function * ({objectId, versionHash, startTime, endTime, indexId, query, rating}) {
    const indexLib = yield this.client.ContentObjectLibraryId({objectId: indexId});
    const indexContentInfo = yield this.client.ContentObject({objectId: indexId, libraryId: indexLib});
    const indexHash = indexContentInfo.hash;
    const token = yield this.client.CreateSignedToken({
      objectId,
      duration: 24 * 60 * 60 * 1000,
    });

    const userAddr = yield this.client.CurrentAccountAddress();
    const url = `https://appsvc.svc.eluv.io/state/main/app/search_v2/feedback/${userAddr}/set?authorization=${token}`;
    const itemBody = {
      item: {
        content: objectId,
        clip_start: parseInt(startTime),
        clip_end: parseInt(endTime),
        index: indexId,
        query: query,
      },
      rating: rating,
      additional: {
        content_hash: versionHash,
        index_hash: indexHash,
      }
    };
    const body = JSON.stringify(itemBody);

    try {
      return this.client.Request({url, body, method: "POST"});
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to set rating results", error);
      throw error;
    }
  });

  GetRatingResults = flow(function * ({objectId, startTime, endTime, indexId, query}) {
    const token = yield this.client.CreateSignedToken({
      objectId,
      duration: 24 * 60 * 60 * 1000,
    });

    const userAddr = yield this.client.CurrentAccountAddress();
    const url = `https://appsvc.svc.eluv.io/state/main/app/search_v2/feedback/${userAddr}/get?authorization=${token}`;
    const itemBody = {
      item: {
        content: objectId,
        clip_start: parseInt(startTime),
        clip_end: parseInt(endTime),
        index: indexId,
        query: query,
      }
    };
    const body = JSON.stringify(itemBody);

    try {
      return this.client.Request({url, body, method: "POST"});
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get rating results", error);
    }
  });
}

export default RatingStore;
