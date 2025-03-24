import {flow, makeAutoObservable} from "mobx";
import {searchStore} from "@/stores/index.js";

// Store for managing clip generated summaries and captions
class SummaryStore {
  loadingSummary = false;
  mlcacheHostname = "ai.contentfabric.io"

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  SetMlcacheHostname = ({host="ai.contentfabric.io"}) => {
     this.mlcacheHostname = host
  }

  ToggleLoading = () => {
    this.loadingSummary = !this.loadingSummary;
  };

  GetCaptionUrl = flow(function * ({
    objectId,
    fileName
  }) {
    try {
      const queryParams = {
        asset: fileName
      };

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "caption",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://${this.mlcacheHostname}/caption/q/${objectId}`
        .concat(url.slice(_pos));

      return newUrl;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get caption URL", error);
    }
  });

  GetSummaryUrl = flow(function * ({
    objectId,
    startTime,
    endTime,
    prefix,
    assetType=false,
    cache=true,
    caption=false,
    regenerate=false,
    v2=false
  }) {
    try {
      let requestRep, requestUrl, server;
      const queryParams = {
        // tracks: "speech_to_text,object_detection,celebrity_detection"
      };

      if(assetType) {
        // All images
        queryParams["path"] = prefix.toString();
        requestRep = "image_summarize";
        server = "ai-02";

        if(caption) {
          // Image Caption
          requestUrl = "ml/summary";

          queryParams["regenerate"] = regenerate;
          queryParams["engine"] = v2 ? "caption2" : "caption";

          if(regenerate) {
            queryParams["cache"] = "none";
          }
        } else {
          // Image Synopsis
          requestUrl = "summary";
          queryParams["engine"] = "synopsis";
        }
      } else {
        queryParams["start_time"] = startTime;
        queryParams["end_time"] = endTime;
        requestRep = "summarize";
        requestUrl = "mlcache/summary";
        server = "ai-03";
      }

      if(!cache) {
        queryParams["regenerate"] = true;
      }

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: requestRep,
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://${this.mlcacheHostname}/${requestUrl}/q/${objectId}`
        .concat(url.slice(_pos));

      return newUrl;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get summary URL", error);
    }
  });

  ClearCaptionCache = flow(function * ({objectId, prefix}) {
    const url = yield this.GetSummaryUrl({
      objectId,
      prefix,
      caption: true,
      assetType: true
    });

    yield this.client.Request({
      url,
      format: "",
      method: "DELETE"
    });
  });

  GetCaptionApprovalState = flow(function * ({
    libraryId,
    objectId,
    prefix,
    cache=true
  }) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const metadata = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: `${prefix}/manual_metadata/caption_approved`
      });

      const value = (metadata === undefined) ? false : metadata;

      if(cache) {
        searchStore.UpdateSelectedSearchResult({
          key: "_captionApproved",
          value
        });
      }

      return value;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Unable to get caption approval state", error);
    }
  });

  UpdateCaptionApprovalState = flow(function * ({
    libraryId,
    objectId,
    prefix,
    value
  }) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const {writeToken} = yield this.client.EditContentObject({
        libraryId,
        objectId
      });

      yield this.client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: `${prefix}/manual_metadata/caption_approved`,
        metadata: value
      });

      yield this.client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
        commitMessage: "Set caption_approved state"
      });

      searchStore.UpdateSelectedSearchResult({
        key: "_captionApproved",
        value
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Unable to update caption approval state", error);
    }
  });

  GetCaptionResults = flow(function * ({
    objectId,
    prefix,
    regenerate=false,
    v2=false
  }) {
    let url;
    try {
      url = yield this.GetSummaryUrl({
        objectId,
        prefix,
        regenerate,
        assetType: true,
        caption: true,
        v2
      });

      const results = yield this.client.Request({url});

      yield this.GetCaptionApprovalState({
        objectId,
        prefix
      });

      searchStore.UpdateSelectedSearchResult({
        key: "_caption",
        value: results
      });

      return results;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get caption", error);
    }
  });

  UpdateCaptions = flow(function * ({
    libraryId,
    objectId,
    prefix,
    values
  }) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const {writeToken} = yield this.client.EditContentObject({
        libraryId,
        objectId
      });

      const description = values.summary;
      delete values.summary;

      yield this.client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: `${prefix}/display_metadata`,
        metadata: {
          ...values,
          "Description": description
        }
      });

      yield this.client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
        commitMessage: "Update display_metadata"
      });

      searchStore.UpdateSelectedSearchResult({
        key: "_caption",
        value: {
          ...searchStore.selectedSearchResult._caption,
          summary: description,
          display_metadata: values
        }
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update caption values", error);
    }
  });

  GetSummaryResults = flow(function * ({
    objectId,
    startTime,
    endTime,
    prefix,
    assetType=false,
    cache=true
  }) {
    let url;
    try {
      this.ToggleLoading();
      url = yield this.GetSummaryUrl({
        objectId,
        startTime,
        endTime,
        assetType,
        prefix,
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
