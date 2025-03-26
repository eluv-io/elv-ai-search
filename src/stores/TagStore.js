
// Store for managing tags for clips
import {flow, makeObservable} from "mobx";

class TagStore {
  constructor(rootStore) {
    makeObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  GetTags = flow(function * ({
    dedupe=false,
    assetType=false,
    prefix,
    objectId,
    startTime,
    endTime
  }={}) {
    let requestRep;
    const libraryId = yield this.client.ContentObjectLibraryId({objectId});

    const queryParams = {
      start_time: startTime,
      end_time: endTime
    };

    if(dedupe) {
      // De-duplicates results
      queryParams["dedupe"] = true;
    }

    if(assetType) {
      requestRep = "image_tags";
      queryParams["path"] = prefix.toString();
    } else {
      requestRep = "tags";
    }

    const url = yield this.client.Rep({
      libraryId,
      objectId,
      rep: requestRep,
      service: "search",
      makeAccessRequest: true,
      queryParams
    });

    const _pos = url.indexOf(`/${requestRep}?`);
    const newUrl = `https://${this.rootStore.searchStore.searchHostname}.contentfabric.io/search/qlibs/${libraryId}/q/${objectId}`
      .concat(url.slice(_pos));

    try {
      let results = yield this.client.Request({url: newUrl});
      const topics = results?.["Sports Topic"];

      results = Object.fromEntries(
        Object.entries(results).map(([key, value]) => {
          // Tag keys for images will be snake_case
          // Tag keys for videos will be Title Case
          const TransformKey = (key) => {
            return key
              .split("_")
              .map(word => assetType ? (
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ) : word
              )
              .join(" ");
          };

          return [TransformKey(key), {items: value, field: key, displayName: key}];
        })
      );

      if(!dedupe && !results?.error) {
        this.rootStore.searchStore.UpdateSelectedSearchResult({
          key: "_tags",
          value: results
        });
      }

      this.rootStore.searchStore.UpdateSelectedSearchResult({
        key: dedupe ? "_topics_deduped" : "_topics",
        value: topics
      });

      return {
        tags: results,
        topics
      };
    } catch(error) {
      console.error("Failed to load tags", error);
      this.rootStore.searchStore.UpdateSelectedSearchResult({
        key: "_tags",
        value: null
      });
    }
  });

  ParseTags = ({sources=[]}) => {
    const parsedTags = {};
    Object.keys(sources).forEach(source => {
      const label = source
        .replace("f_", "")
        .split("_")
        .join(" ")
        .replace(/\b\w/g, char => char.toUpperCase());

      if(!parsedTags[label]) {
        parsedTags[label] = [];
      }

      parsedTags[label].push({
        text: sources[source]
      });
    });

    return parsedTags;
  };

  UpdateTags = flow(function * ({
    libraryId,
    objectId,
    metadataSubtree,
    copyPath,
    value,
    tagIndex,
    tagKey
  }){
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
        metadataSubtree,
        metadata: value
      });

      yield this.client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: copyPath,
        metadata: value
      });

      yield this.client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
        commitMessage: "Update tags"
      });

      const newTags = Object.assign({}, this.rootStore.searchStore.selectedSearchResult._tags);

      if(newTags[tagKey]?.items?.[tagIndex]?.text) {
        newTags[tagKey].items[tagIndex].text = value;
      }

      this.rootStore.searchStore.UpdateSelectedSearchResult({
        key: "_tags",
        value: newTags
      });
    } catch(error) {
      console.error("Failed to update tag", error);
    }
  });
}

export default TagStore;
