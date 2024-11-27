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
  searchType = "ALL";

  resultsBySong = null;
  resultsVideo = null;
  resultsImage = null;

  highScore = 50;
  highScoreVideoResults = null;
  highScoreImageResults = null;

  selectedSearchResult;
  musicSettingEnabled = false;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  get results() {
    return {
      video: this.resultsVideo,
      videoHighScore: this.highScoreVideoResults,
      bySong: this.resultsBySong,
      image: this.resultsImage,
      imageHighScore: this.highScoreImageResults
    };
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

  SetCurrentSearch = ({
    results,
    resultsBySong,
    videoResults,
    imageResults,
    index,
    terms,
    highScoreVideoResults,
    highScoreImageResults
  }) => {
    this.currentSearch.results = {...results};
    this.highScoreImageResults = highScoreImageResults;
    this.highScoreVideoResults = highScoreVideoResults;
    this.currentSearch.resultsBySong = {...resultsBySong};
    this.currentSearch.index = index;
    this.currentSearch.terms = terms;
    this.resultsVideo = videoResults;
    this.resultsImage = imageResults;
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

  SetSearchType = ({type}) => {
    this.searchType = type;
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
    musicType,
    searchType
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
          clips: searchType === "IMAGES" ? false : true,
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
    let searchAssetType = false;
    // let fuzzySearchFields;
    const indexerMetadata = yield this.client.ContentObjectMetadata({
      libraryId: yield this.client.ContentObjectLibraryId({objectId}),
      objectId: objectId,
      metadataSubtree: "indexer/config/indexer/arguments",
      select: [
        "document/prefix",
        // "fields"
      ]
    });

    if(indexerMetadata?.document?.prefix?.includes("assets")) {
      searchAssetType = true;
    }

    // if(indexerMetadata?.fields) {
    //   fuzzySearchFields = Object.keys(indexerMetadata?.fields || {})
    //     .filter(field => indexerMetadata?.fields[field].type === "text")
    //     // .filter(field => selectedFields.includes(field))
    //     .map(field => `f_${field}`);
    // }

    return {
      // fuzzySearchFields,
      searchAssetType
    };
  });

  ResetSearch = () => {
    this.SetCurrentSearch({
      results: null,
      resultsBySong: null,
      videoResults: null,
      imageResults: null,
      highScoreResults: null,
      index: this.currentSearch.index,
      terms: this.currentSearch.terms
    });
    this.SetSearchType({type: "ALL"});
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

  GetTags = flow(function * (dedupe=false) {
    const {id: objectId, start_time: startTime, end_time: endTime} = this.selectedSearchResult;
    const libraryId = yield this.client.ContentObjectLibraryId({objectId});

    const queryParams = {
      start_time: startTime,
      end_time: endTime
    };

    if(dedupe) {
      // De-duplicates results
      queryParams["dedupe"] = true;
    }

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

      if(!dedupe && !results?.error) {
        this.UpdateSelectedSearchResult({
          key: "_tags",
          value: results
        });
      }

      this.UpdateSelectedSearchResult({
        key: dedupe ? "_topics_deduped" : "_topics",
        value: topics
      });

      return {
        tags: results,
        topics
      };
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load tags", error);
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

  GetSearchScore = ({clip, score}) => {
    let highScore;

    // Score is provided as a single float
    if(score) {
      highScore = score;
    } else {
      // Score is provided as an array of scores
      const scores = clip?.sources?.map(source => source.score);
      highScore = Math.max(...scores);

      highScore = highScore * 100;
    }

    return highScore ? highScore.toFixed(1) : "";
  };

  ParseResults = flow(function * ({url, searchType}) {
    try {
      let videoResults, imageResults, resultsBySong;
      let results = yield this.client.Request({url});
      let editedContents;

      editedContents = yield Promise.all(
        (results.contents || results.results).map(async (result, i) => {
          let url;

          if(searchType === "IMAGES") {
            result["_score"] = this.GetSearchScore({score: result.score});
            result["_assetType"] = true;

            url = await this.rootStore.GetFilePath({
              objectId: result.id,
              path: result.prefix
            });

            result["_imageSrc"] = url;
            result["_tags"] = this.ParseTags({
              sources: result?.fields
            });
          } else {
            try {
              url = await this.rootStore.GetThumbnail({
                objectId: result.id,
                imagePath: result.image_url,
                timeSecs: [null, undefined].includes(result.start_time) ? null : result.start_time / 1000
              });
              result["_imageSrc"] = url;
            } catch(error) {
              // eslint-disable-next-line no-console
              console.error(`Unable to retrieve thumbnail for ${result.id}`, error);
            }

            result["_score"] = this.GetSearchScore({clip: result});
          }

          result["_index"] = i;

          return result;
        })
      );

      if(searchType === "IMAGES") {
        imageResults = {
          ...results,
          contents: editedContents
        };
      } else {
        resultsBySong = this.ParseResultsBySong({results: results.contents});
        videoResults = {
          ...results,
          contents: editedContents
        };
      }

      const highScoreResults = (results.contents || []).filter(item => {
        (parseInt(item._score || "") >= this.highScore) || [null, undefined, ""].includes(item._score);
      });

      return {
        imageResults,
        videoResults,
        resultsBySong,
        highScoreResults
      };
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Unable to perform search", error);
    }
  });

  GetSearchResults = flow(function * ({
    fuzzySearchValue,
    fuzzySearchFields,
    musicType,
    cacheResults=true
  }) {
    let objectId, versionHash, imageUrl, videoUrl, imageResults, videoResults, resultsBySong, highScoreImage, highScoreVideo;
    const indexValue = this.customIndex || this.currentSearch.index;

    if(indexValue.startsWith("hq__")) {
      versionHash = indexValue;
    } else if(indexValue.startsWith("iq__")) {
      objectId = indexValue;
    }

    // Determine whether index is asset type
    // const {searchAssetType} = yield this.GetSearchParams({
    //   objectId
    // });

    const ImageRequest = this.CreateVectorSearchUrl({
      objectId,
      versionHash,
      searchPhrase: fuzzySearchValue,
      searchFields: fuzzySearchFields,
      musicType: musicType,
      searchType: "IMAGES"
    });

    const VideoRequest = this.CreateVectorSearchUrl({
      objectId,
      versionHash,
      searchPhrase: fuzzySearchValue,
      searchFields: fuzzySearchFields,
      musicType: musicType,
      searchType: "VIDEOS"
    });

    if(this.searchType === "ALL") {
      imageUrl = yield ImageRequest;
      videoUrl = yield VideoRequest;

      ({videoResults, resultsBySong, highScoreResults: highScoreVideo} = yield this.ParseResults({url: videoUrl.url, searchType: "VIDEOS"}));
      ({imageResults, highScoreResults: highScoreImage} = yield this.ParseResults({url: imageUrl.url, searchType: "IMAGES"}));
    } else if(this.searchType === "IMAGES") {
      imageUrl = yield ImageRequest();
      ({imageResults, highScoreResults: highScoreVideo} = yield this.ParseResults({url: imageUrl.url, searchType: "IMAGES"}));
    } else if(this.searchType === "VIDEOS") {
      videoUrl = yield VideoRequest();
      ({videoResults, resultsBySong, highScoreResults: highScoreVideo} = yield this.ParseResults({url: videoUrl.url, searchType: "VIDEOS"}));
    }

    if(cacheResults) {
      this.SetCurrentSearch({
        videoResults,
        imageResults,
        resultsBySong,
        highScoreImageResults: highScoreImage,
        highScoreVideoResults: highScoreVideo,
        index: objectId,
        terms: fuzzySearchValue
      });
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
