import {makeAutoObservable, flow} from "mobx";

// Store for fetching search results
class SearchStore {
  searchV1Node;
  searchV2Node;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  CreateSearchUrl = flow(function * ({
    objectId,
    versionHash,
    libraryId,
    searchVersion,
    search,
    fuzzySearchPhrase,
    fuzzySearchField,
    searchAssets,
  }) {
    try {
      if(searchVersion === "v1") {
        console.log("doing V1 search");
        // searchV1
        const url = yield this.client.Rep({
          libraryId,
          objectId,
          versionHash,
          rep: "search",
          service: "search",
          makeAccessRequest: true,
          queryParams: {
            terms: `(${search})`,
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
        console.log("doing V2 search");
        const queryParams = {
          terms:
            fuzzySearchPhrase === ""
              ? `(${search})`
              : search === ""
                ? fuzzySearchPhrase
                : `((${fuzzySearchPhrase}) AND ${search})`,
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

        if(fuzzySearchPhrase === "") {
          queryParams.sort = "f_start_time@asc";
          queryParams.scored = false;
        } else {
          // only  set the max-total when we are using fuzzy search
          queryParams.max_total = 160;
        }

        // for the two pass approach,
        // if we do not have the exact match filters, we should enable semantic=true
        if(search === "") {
          queryParams.semantic = true;
        }
        // for assets index type, disable clip and relevant parms
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
          console.log("configData", configData)
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

  GetSearchResults = flow(function * ({
    libraryId,
    objectId,
    versionHash,
    searchVersion
  }) {
    const url = yield this.CreateSearchUrl({
      [objectId.startsWith("iq") ? "objectId" : "versionHash"]: objectId,
      libraryId,
      searchVersion: searchVersion.current,
      search: _search,
      fuzzySearchPhrase: _fuzzySearchPhrase,
      fuzzySearchField: _fuzzySearchField,
      searchAssets: searchAssets.current,
    });
  });
}

export default SearchStore;
