import {makeAutoObservable, flow} from "mobx";
import {ToTitleCase} from "@/utils/helpers.js";

// Store for fetching search results
class SearchStore {
  currentSearch = {
    results: null,
    resultsBySong: null,
    index: "",
    terms: "",
    searchFields: null
  };
  customIndex = "";
  searchHostname = "ai";
  highScore = 50;
  highScoreResults = null;
  selectedSearchResult;
  musicSettingEnabled = false;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  ToggleMusicSetting = () => {
    this.musicSettingEnabled = !this.musicSettingEnabled;
  };

  SetSelectedSearchResult = ({result}) => {
    this.selectedSearchResult = result;
  };

  UpdateSelectedSearchResult = ({key, value}) => {
    this.selectedSearchResult[key] = value;
  };

  SetCurrentSearch = ({results, resultsBySong, index, terms, highScoreResults}) => {
    this.currentSearch.results = {...results};
    this.highScoreResults = highScoreResults;
    this.currentSearch.resultsBySong = {...resultsBySong};
    this.currentSearch.index = index;
    this.currentSearch.terms = terms;
  };

  SetSearchIndex = ({index}) => {
    this.currentSearch.index = index;
  };

  SetSearchHostname = ({host="ai"}) => {
    this.searchHostname = host;
  };

  SetCustomIndex = ({index}) => {
    this.customIndex = index;
  };

  SetSearchFields = ({fields}) => {
    this.currentSearch.searchFields = fields;
  };

  GetSearchFields = flow(function * ({index}) {
    if(!index) { return; }

    let libraryId, objectId, versionHash;

    try {
      this.SetSearchFields({fields: null});

      if(index.startsWith("hq__")) {
        versionHash = index;
      } else if(index.startsWith("iq__")) {
        objectId = index;
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const indexerFields = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        versionHash,
        metadataSubtree: "indexer/config/indexer/arguments/fields"
      });

      const fuzzySearchFields = {};
      const excludedFields = ["music", "action", "segment", "title_type", "asset_type"];
      Object.keys(indexerFields || {})
        .filter(field => {
          const isTextType = indexerFields[field].type === "text";
          const isNotExcluded = !excludedFields.some(exclusion => field.includes(exclusion));
          return isTextType && isNotExcluded;
        })
        .forEach(field => {
          fuzzySearchFields[`f_${field}`] = {
            label: ToTitleCase({text: field.split("_").join(" ")}),
            value: true
          };
        });

      this.SetSearchFields({fields: fuzzySearchFields});
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Unable to load search fields", error);
      this.SetSearchFields({fields: null});
    }
  });

  // CreateSearchUrl = flow(function * ({
  //   objectId,
  //   versionHash,
  //   searchVersion,
  //   fuzzySearchValue,
  //   fuzzySearchField,
  //   searchAssets,
  // }) {
  //   try {
  //     const libraryId = yield this.client.ContentObjectLibraryId({objectId, versionHash});
  //
  //     if(searchVersion === "v1") {
  //       // search v1
  //       const url = yield this.client.Rep({
  //         libraryId,
  //         objectId,
  //         versionHash,
  //         rep: "search",
  //         service: "search",
  //         makeAccessRequest: true,
  //         queryParams: {
  //           terms: fuzzySearchValue,
  //           select: "...,text,/public/asset_metadata/title",
  //           start: 0,
  //           limit: 160,
  //           clips_include_source_tags: true,
  //           clips: true,
  //           sort: "f_start_time@asc",
  //         },
  //       });
  //       return { url, status: 0 };
  //     } else {
  //       // search v2
  //       const queryParams = {
  //         terms: fuzzySearchValue,
  //         select: "/public/asset_metadata/title",
  //         start: 0,
  //         limit: 160,
  //         display_fields: "all",
  //         clips: true,
  //         scored: true,
  //         clips_include_source_tags: true,
  //         clips_max_duration: 55,
  //       };
  //
  //       if(fuzzySearchField.length > 0) {
  //         queryParams.search_fields = fuzzySearchField.join(",");
  //       }
  //
  //       if(fuzzySearchValue === "") {
  //         queryParams.sort = "f_start_time@asc";
  //         queryParams.scored = false;
  //       } else {
  //         // only  set the max-total when we are using fuzzy search
  //         queryParams.max_total = 160;
  //       }
  //
  //       // for the two pass approach,
  //       // if we do not have the exact match filters, we should enable semantic=true
  //       queryParams.semantic = true;
  //
  //       // for assets index type, disable clip and relevant params
  //       if(searchAssets === true) {
  //         queryParams.clips = false;
  //       }
  //
  //       const url = yield this.client.Rep({
  //         libraryId,
  //         objectId,
  //         versionHash,
  //         rep: "search",
  //         service: "search",
  //         makeAccessRequest: true,
  //         queryParams: queryParams,
  //       });
  //
  //       if(!this.searchV2Node) {
  //         const configData = yield this.client.Request({
  //           url: yield this.client.ConfigUrl()
  //         });
  //         this.searchV2Node = configData?.data?.network?.services?.search_v2?.[0];
  //       }
  //
  //       const s1 = url.indexOf("contentfabric");
  //       const s2 = this.searchV2Node.indexOf("contentfabric");
  //       const newUrl = this.searchV2Node.slice(0, s2).concat(url.slice(s1));
  //
  //       return {
  //         url: newUrl,
  //         status: 0
  //       };
  //     }
  //   } catch(error) {
  //     // eslint-disable-next-line no-console
  //     console.error(error);
  //     return { url: "", status: 1 };
  //   }
  // });

  CreateVectorSearchUrl = flow(function * ({
    objectId,
    versionHash,
    searchPhrase,
    searchFields,
    musicType
  }) {
    try {
      let libraryId, queryParams;

      // Music mode search
      if(this.musicSettingEnabled) {
        let musicParams = {
          terms: searchPhrase || "",
          search_fields: "f_music",
          threshold: 0
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
            ...musicParams,
            select: "/public/asset_metadata/title",
            limit: 160,
            start: 0,
            text: false,
            clips: true,
            clips_include_source_tags: true,
            clips_max_duration: 55,
            max_total: searchPhrase ? 30 : -1
          };

          if(!searchPhrase) {
            queryParams["sort"] = "f_music";
          }
        }
      } else {
        // Regular search
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
          max_total: 40,
          select: "/public/asset_metadata/title"
        };
      }

      if(objectId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId});
      }

      const url = yield this.client.Rep({
        libraryId,
        objectId,
        versionHash,
        select: "/public/asset_metadata/title",
        rep: "search",
        service: "search",
        makeAccessRequest: true,
        queryParams: queryParams
      });

      const contentObject = versionHash ?
        (`q/${versionHash}`) :
        `qlibs/${libraryId}/q/${objectId}`;

      const _pos = url.indexOf("/rep/");
      const newUrl = `https://${this.searchHostname}.contentfabric.io/search/${contentObject}`.concat(url.slice(_pos));
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

    if(indexerMetadata?.fields) {
      fuzzySearchFields = Object.keys(indexerMetadata?.fields || {})
        .filter(field => indexerMetadata?.fields[field].type === "text")
        // .filter(field => selectedFields.includes(field))
        .map(field => `f_${field}`);
    }

    return {
      fuzzySearchFields,
      searchAssets
    };
  });

  ResetSearch = () => {
    this.SetCurrentSearch({
      results: null,
      resultsBySong: null,
      highScoreResults: null,
      index: this.currentSearch.index,
      terms: this.currentSearch.terms
    });
  };

  GetCoverImage = flow(function * ({song, queryParams}) {
    try {
      const objectId = "iq__3MmY78ZgtY4wXxMQMtqUWqnxy2kR";
      const libraryId = yield this.client.ContentObjectLibraryId({objectId});

      const Sha1 = async (string) => {
        const digest = await (crypto.subtle || crypto.webcrypto.subtle).digest("SHA-1", new TextEncoder().encode(string));
        const res = [...new Uint8Array(digest)];
        return res.map(x => x.toString(16).padStart(2, "0")).join("");
      };

      const hashname = yield Sha1(song);

      // const url = yield this.client.Rep({
      //   libraryId,
      //   objectId,
      //   rep: `image/default/files/covers/${hashname}.png`,
      //   queryParams
      // });

      const url = yield this.client.FileUrl({
        libraryId,
        objectId,
        filePath: `covers/${hashname}.png`,
        queryParams
      });

      return url;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to get cover for ${song}`, error);
    }
  });

  GetTags = flow(function * ({objectId, startTime, endTime}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId});

    const queryParams = {
      start_time: startTime,
      end_time: endTime
    };

    const url = yield this.client.Rep({
      libraryId,
      objectId,
      rep: "tags",
      service: "search",
      makeAccessRequest: true,
      queryParams
    });

    const _pos = url.indexOf("/tags?");
    const newUrl = `https://${this.searchHostname}.contentfabric.io/search/qlibs/${libraryId}/q/${objectId}`
      .concat(url.slice(_pos));

    try {
      const results = yield this.client.Request({url: newUrl});
      const topics = results?.["Sports Topic"];

      return {
        tags: results,
        topics
      };
    } catch(error) {
      console.error("Failed to load tags", error);
    }
  });

  ParseTags = flow(function * ({sources=[], objectId, startTime, endTime}){
    const parsedTags = {};
    let parsedTopics = [];

    const libraryId = yield this.client.ContentObjectLibraryId({objectId});
    const queryParams = {
      start_time: startTime,
      end_time: endTime
    };

    const url = yield this.client.Rep({
      libraryId,
      objectId,
      rep: "tags",
      service: "search",
      makeAccessRequest: true,
      queryParams
    });

    const _pos = url.indexOf("/tags?");
    const newUrl = `https://${this.searchHostname}.contentfabric.io/search/qlibs/${libraryId}/q/${objectId}`
      .concat(url.slice(_pos));
    //
    // const allTags = sources.reduce((acc, source) => {
    //   Object.entries(source.fields).forEach(([key, value]) => {
    //     if(key.includes("_tag")) {
    //       if(acc.fields[key]) {
    //         acc.fields[key] = acc.fields[key].concat(value);
    //       } else {
    //         acc.fields[key] = value;
    //       }
    //     }
    //   });
    //
    //   return acc;
    // }, {fields: {}});
    //
    // for(let i = 0; i < Object.keys(allTags.fields || {}).length; i++) {
    //   const tagKey = Object.keys(allTags.fields)[i];
    //
    //   if(tagKey.includes("music")) {
    //     const tagsArray = yield Promise.all(
    //       (allTags.fields?.[tagKey] || []).map(async (tag) => {
    //         const coverUrl = await this.GetCoverImage({
    //           song: tag.text?.[0],
    //           queryParams: {
    //             width: 50,
    //             height: 50
    //           }
    //         });
    //
    //         tag["_coverImage"] = coverUrl;
    //
    //         return tag;
    //       })
    //     );
    //     parsedTags[tagKey] = tagsArray.sort((a, b) => a.start_time < b.start_time);
    //   } else if(tagKey.includes("topic")) {
    //     parsedTopics = allTags.fields?.[tagKey].flatMap(item => item.text);
    //   } else {
    //     parsedTags[tagKey] = allTags.fields?.[tagKey].sort((a, b) => a.start_time - b.start_time);
    //   }
    // }

    return {
      parsedTags,
      parsedTopics
    };
  });

  ParseResultsBySong = ({results}) => {
    const resultsBySong = {};
    (results || []).forEach(result => {
      const songs = result?.sources?.[0]?.fields?.f_music || [];

      songs.forEach(song => {
        if(Object.hasOwn(resultsBySong, song)) {
          resultsBySong[song].push(result);
        } else {
          resultsBySong[song] = [result];
        }
      });
    });

    return resultsBySong;
  };

  GetSearchScore = ({clip}) => {
    const scores = clip?.sources?.map(source => source.score);
    const highScore = Math.max(...scores);

    return highScore ? (highScore * 100).toFixed(1) : "";
  };

  GetSearchResults = flow(function * ({
    // objectId,
    // versionHash,
    fuzzySearchValue,
    fuzzySearchFields,
    musicType,
    cacheResults=true
  }) {
    let urlResponse, objectId, versionHash;
    const indexValue = this.customIndex || this.currentSearch.index;

    if(indexValue.startsWith("hq__")) {
      versionHash = indexValue;
    } else if(indexValue.startsWith("iq__")) {
      objectId = indexValue;
    }

    urlResponse = yield this.CreateVectorSearchUrl({
      objectId,
      versionHash,
      searchPhrase: fuzzySearchValue,
      searchFields: fuzzySearchFields,
      musicType: musicType
    });

    // Used for v1 search. Unsupported until further notice
    // The search engine is changed in a way that is no longer compatible with v1 indexes
    // urlResponse = yield this.CreateSearchUrl({
    //   objectId,
    //   versionHash,
    //   fuzzySearchValue,
    //   searchVersion, // 1 or 2
    //   fuzzySearchFields,
    //   searchAssets,
    // });

    if(urlResponse.status !== 0) {
      // TODO: Error handling
      throw Error("Failed to create search query URL");
    }

    try {
      let results = yield this.client.Request({url: urlResponse.url});
      let editedContents;

      editedContents = yield Promise.all(
        (results.contents || results.results).map(async (result, i) => {
          try {
            let url = await this.rootStore.GetThumbnail({
              objectId: result.id,
              imagePath: result.image_url,
              timeSecs: result.start_time ? result.start_time / 1000 : null
            });
            result["_imageSrc"] = url;
            const tagsResponse = await this.GetTags({
              // sources: result?.sources,
              objectId: result.id,
              startTime: result.start_time,
              endTime: result.end_time
            });
            result["_tags"] = tagsResponse?.tags;
            result["_topics"] = tagsResponse?.topics;
            result["_score"] = this.GetSearchScore({clip: result});
            result["_index"] = i;

            return result;
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(`Unable to retrieve thumbnail for ${result.id}`);
          }
        })
      );

      const resultsBySong = this.ParseResultsBySong({results: results.contents});

      results.contents = editedContents;

      const highScoreResults = (results.contents || []).filter(item => {
        (parseInt(item._score || "") >= this.highScore) || [null, undefined, ""].includes(item._score);
      });

      if(cacheResults) {
        this.SetCurrentSearch({
          results,
          resultsBySong,
          highScoreResults,
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

  GetShareUrls = flow(function * () {
    const embedUrl = yield this.client.EmbedUrl({
      objectId: this.selectedSearchResult.id,
      options: {
        clipStart: this.selectedSearchResult.start_time / 1000,
        clipEnd: this.selectedSearchResult.end_time / 1000
      }
    });
    const {id: objectId, start_time: startTime, end_time: endTime, qlib_id: libraryId} = this.selectedSearchResult;

    const downloadUrl = yield this.rootStore.GetDownloadUrlWithMaxResolution({objectId, startTime, endTime, libraryId});

    return {
      embedUrl,
      downloadUrl
    };
  });
}

export default SearchStore;
