import {makeAutoObservable, flow} from "mobx";
import {ASSETS_SEARCH_FIELDS} from "@/utils/constants.js";

// Store for fetching search results
class SearchStore {
  searchV1Node;
  searchV2Node;
  currentSearch = {
    results: null,
    index: "",
    terms: ""
  };
  selectedSearchResult;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  SetSelectedSearchResult = ({result}) => {
    this.selectedSearchResult = result;
  };

  SetCurrentSearch = ({results, index, terms}) => {
    this.currentSearch["results"] = {...results};
    this.currentSearch["index"] = index;
    this.currentSearch["terms"] = terms;
  };

  CreateSearchUrl = flow(function * ({
    objectId,
    versionHash,
    searchVersion,
    fuzzySearchValue,
    fuzzySearchField,
    searchAssets,
  }) {
    try {
      const libraryId = yield this.client.ContentObjectLibraryId({objectId, versionHash});

      if(searchVersion === "v1") {
        // search v1
        const url = yield this.client.Rep({
          libraryId,
          objectId,
          versionHash,
          rep: "search",
          service: "search",
          makeAccessRequest: true,
          queryParams: {
            terms: fuzzySearchValue,
            select: "...,text,/public/asset_metadata/title",
            start: 0,
            limit: 160,
            clips_include_source_tags: true,
            clips: true,
            sort: "f_start_time@asc",
          },
        });
        return { url, status: 0 };
      } else {
        // search v2
        const queryParams = {
          terms: fuzzySearchValue,
          select: "/public/asset_metadata/title",
          start: 0,
          limit: 160,
          display_fields: "all",
          clips: true,
          scored: true,
          clips_include_source_tags: true,
          clips_max_duration: 55,
        };

        if(fuzzySearchField.length > 0) {
          queryParams.search_fields = fuzzySearchField.join(",");
        }

        if(fuzzySearchValue === "") {
          queryParams.sort = "f_start_time@asc";
          queryParams.scored = false;
        } else {
          // only  set the max-total when we are using fuzzy search
          queryParams.max_total = 160;
        }

        // for the two pass approach,
        // if we do not have the exact match filters, we should enable semantic=true
        queryParams.semantic = true;

        // for assets index type, disable clip and relevant params
        if(searchAssets === true) {
          queryParams.clips = false;
        }

        const url = yield this.client.Rep({
          libraryId,
          objectId,
          versionHash,
          rep: "search",
          service: "search",
          makeAccessRequest: true,
          queryParams: queryParams,
        });

        if(!this.searchV2Node) {
          const configData = yield this.client.Request({
            url: yield this.client.ConfigUrl()
          });
          this.searchV2Node = configData?.data?.network?.services?.search_v2?.[0];
        }

        const s1 = url.indexOf("contentfabric");
        const s2 = this.searchV2Node.indexOf("contentfabric");
        const newUrl = this.searchV2Node.slice(0, s2).concat(url.slice(s1));

        return {
          url: newUrl,
          status: 0
        };
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return { url: "", status: 1 };
    }
  });

  CreateVectorSearchUrl = flow(function * ({
    objectId,
    searchPhrase,
    searchFields,
    music=false,
    musicType="all"
  }) {
    try {
      const libraryId = yield this.client.ContentObjectLibraryId({objectId});

      let queryParams, server;

      if(music) {
        server = "ai";
        let musicParams = {
          terms: searchPhrase || "",
          search_fields: "f_music",
          max_total: 30
        };

        if(musicType === "histogram") {
          queryParams = {
            ...musicParams,
            stats: "f_music_as_string",
            limit: 0,
            max_total: -1
          };
        } else if(musicType === "all") {
          queryParams = {
            select: "/public/asset_metadata/title",
            limit: 160,
            start: 0,
            text: false,
            sort: "f_music",
            clips: true,
            clips_include_source_tags: true,
            max_total: 30
          };
        }
      } else {
        server = "ai-02";
        queryParams = {
          terms: searchPhrase,
          search_fields: searchFields.join(","),
          start: 0,
          limit: 160,
          display_fields: "all",
          clips: true,
          clips_include_source_tags: true,
          debug: true,
          clips_max_duration: 55,
          max_total: 20,
          select: "/public/asset_metadata/title"
        };
      }

      const url = yield this.client.Rep({
        libraryId,
        objectId,
        versionHash: undefined,
        select: "/public/asset_metadata/title",
        rep: "search",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const _pos = url.indexOf("/rep/");
      // TODO: change back to ai-02 to get regular search working
      const newUrl = `https://${server}.contentfabric.io/search/qlibs/${libraryId}/q/${objectId}`.concat(url.slice(_pos));
      return { url: newUrl, status: 0 };
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return { url: "", status: 1 };
    }
  });

  GetSearchParams = flow(function * ({objectId}) {
    // TODO: Find a better way to determine searchAssets field
    let searchAssets = false;
    let fuzzySearchFields;
    const indexerMetadata = yield this.client.ContentObjectMetadata({
      libraryId: yield this.client.ContentObjectLibraryId({objectId}),
      objectId: objectId,
      metadataSubtree: "indexer/config/indexer/arguments",
      select: [
        "document/prefix",
        "fields"
      ]
    });

    if(indexerMetadata?.document?.prefix?.includes("assets")) {
      searchAssets = true;
    }

    const selectedFields = ASSETS_SEARCH_FIELDS;

    if(indexerMetadata?.fields) {
      fuzzySearchFields = Object.keys(indexerMetadata?.fields || {})
        .filter(field => selectedFields.includes(field))
        .map(field => `f_${field}`);
    }

    return {
      fuzzySearchFields,
      searchAssets
    };
  });

  GetThumbnail = flow(function * ({
    objectId,
    imagePath
  }) {
    try {
      const base = this.rootStore.networkInfo.name === "main" ?
        "https://main.net955305.contentfabric.io" :
        "https://demov3.net955210.contentfabric.io";
      const fullUrl = new URL(imagePath, base);

      const url = yield this.client.Rep({
        libraryId: yield this.client.ContentObjectLibraryId({objectId}),
        objectId,
        rep: "/frame/default/video",
        channelAuth: true,
        queryParams: {
          t: fullUrl?.searchParams?.get("t"),
          max_offset: 60,
          ignore_trimming: true,
          resolve: true
        }
      });

      return url;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to generate thumbnail url for ${objectId}`, error);
    }
  });

  ResetSearch = () => {
    this.SetCurrentSearch({
      results: null,
      index: this.currentSearch.index,
      terms: this.currentSearch.terms
    });
  };

  ParseTags = ({tags={}}) => {
    const parsedTags = {};

    Object.keys(tags).forEach(tagKey => {
      if(tagKey.includes("_tag")) {
        parsedTags[tagKey] = tags[tagKey];
      }
    });

    return parsedTags;
  };

  GetSearchResults = flow(function * ({
    objectId,
    versionHash,
    fuzzySearchValue,
    searchVersion=2,
    vector=true,
    music=false,
    musicType="all",
    cacheResults=true
  }) {
    const {fuzzySearchFields, searchAssets} = yield this.GetSearchParams({objectId});
    let urlResponse;

    if(vector) {
      urlResponse = yield this.CreateVectorSearchUrl({
        objectId,
        searchPhrase: fuzzySearchValue,
        searchFields: fuzzySearchFields,
        music,
        musicType
      });
    } else {
      urlResponse = yield this.CreateSearchUrl({
        objectId,
        versionHash,
        fuzzySearchValue,
        searchVersion,
        fuzzySearchFields,
        searchAssets,
      });
    }

    if(urlResponse.status !== 0) {
      // TODO: Error handling
      throw Error("Failed to create search query URL");
    }

    try {
      let results = yield this.client.Request({url: urlResponse.url});
      let editedContents;

      editedContents = yield Promise.all(
        (results.contents || results.results).map(async result => {
          try {
            let url = await this.GetThumbnail({
              objectId: result.id,
              imagePath: result.image_url
            });
            result["_imageSrc"] = url;
            result["_tags"] = this.ParseTags({tags: result?.sources?.[0]?.fields});

            return result;
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(`Unable to retrieve thumbnail for ${result.id}`);
          }
        })
      );

      results.contents = editedContents;

      if(cacheResults) {
        this.SetCurrentSearch({
          results,
          index: objectId,
          terms: fuzzySearchValue
        });
      }

      return results;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Unable to perform search", error);
    }
  });

  UpdateSearchResult = ({objectId, key, value}) => {
    if(!this.currentSearch?.results?.contents) { return; }

    let updatedItem;
    this.currentSearch.results.contents = this.currentSearch.results.contents.map(item => {
      if(item.id === objectId) {
        item[key] = value;
        updatedItem = item;
      }

      return item;
    });

    return updatedItem;
  };
}

export default SearchStore;
