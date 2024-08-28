import {makeAutoObservable, flow} from "mobx";
import {ALL_SEARCH_FIELDS, ASSETS_SEARCH_FIELDS} from "@/utils/constants.js";

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
    music=false
  }) {
    try {
      const libraryId = yield this.client.ContentObjectLibraryId({objectId});

      let queryParams;

      if(music) {
        queryParams = {
          terms: searchPhrase,
          start: 0,
          limit: 0,
          max_total: -1,
          stats: "f_music_as_string",
          search_fields: "f_music"
        };
      } else {
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
      const newUrl = `https://ai.contentfabric.io/search/qlibs/${libraryId}/q/${objectId}`.concat(url.slice(_pos));
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

    const selectedFields = searchAssets ? ASSETS_SEARCH_FIELDS : ALL_SEARCH_FIELDS;

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
      const repPosition = imagePath.indexOf("rep");
      let revisedImagePath = `/q/${objectId}/${imagePath.slice(repPosition)}`;
      let url = new URL(revisedImagePath, base);

      const token = yield this.client.GenerateStateChannelToken({objectId});

      url.searchParams.set("resolve", "true");
      url.searchParams.set("authorization", token);

      return url.toString();
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to generate thumbnail url for ${objectId}`, error);
    }
  });

  GetSearchResults = flow(function * ({
    objectId,
    versionHash,
    fuzzySearchValue,
    searchVersion=2,
    vector=true,
    music=false
  }) {
    const {fuzzySearchFields, searchAssets} = yield this.GetSearchParams({objectId});
    let urlResponse;

    if(vector) {
      urlResponse = yield this.CreateVectorSearchUrl({
        objectId,
        searchPhrase: fuzzySearchValue,
        searchFields: fuzzySearchFields,
        music
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

            return result;
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(`Unable to retrieve thumbnail for ${result.id}`);
          }
        })
      );

      results.contents = editedContents;

      this.SetCurrentSearch({
        results,
        index: objectId,
        terms: fuzzySearchValue
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });
}

export default SearchStore;
