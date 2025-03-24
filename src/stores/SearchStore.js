import {makeAutoObservable, flow} from "mobx";
import {ToTitleCase} from "@/utils/helpers.js";
import {CAPTION_KEYS} from "@/utils/data.js";
import {summaryStore} from "@/stores/index.js";

// Store for fetching search results
class SearchStore {
  currentSearch = {
    resultsBySong: null,
    index: "",
    terms: "",
    searchFields: null
  };

  customIndex = "";
  searchHostname = "ai.contentfabric.io";
  searchSummaryType = "synopsis"; // synopsis, caption, caption2
  searchContentType; // ALL, IMAGES, VIDEOS
  resultsViewType; // Show all results vs results that have a high score.
  // Values: HIGH_SCORE | ALL

  // Pagination
  pageSize = 35;
  searchTotal = null;
  startResult = 0; // Used for API payload
  endResult = null; // Used for API payload

  resultsBySong = null;
  resultsVideo = null;
  resultsImage = null;

  resultsImagePaginated = {};
  resultsVideoPaginated = {};

  highScore = 60;
  highScoreVideoResults = null;
  highScoreImageResults = null;

  selectedSearchResult;
  loadingSearchResult = false;
  musicSettingEnabled = false;
  loadingSearch = false;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  get searchResults() {
    switch(this.searchContentType) {
      case "IMAGES":
        return this.resultsViewType === "HIGH_SCORE" ? this.highScoreImageResults : this.resultsImage;
      case "VIDEOS":
        return this.resultsViewType === "HIGH_SCORE" ? this.highScoreVideoResults : this.resultsVideo;
      case "MUSIC":
        return this.resultsVideo;
      default:
        return [];
    }
  }

  GetPaginatedSearchResults({page=1}) {
    switch(this.searchContentType) {
      case "IMAGES":
        return this.resultsImagePaginated[page];
      case "VIDEOS":
        return this.resultsVideoPaginated[page];
      default:
        return [];
    }
  }

  get pagination() {
    const currentPage = this.endResult / this.pageSize;
    const searchTotal = this.resultsViewType === "HIGH_SCORE" ? this.searchResults?.length : this.searchTotal;
    const totalResultsPerPage = searchTotal;
    const totalPages = Math.ceil(searchTotal / this.pageSize);

    return {
      pageSize: this.pageSize,
      startResult: this.startResult,
      endResult: this.endResult,
      // Calculated values
      totalPages,
      currentPage,
      totalResultsPerPage, // total for current page
      searchTotal,
      firstResult: this.startResult + 1,
      lastResult: Math.min(searchTotal, this.endResult)
    };
  }

  get results() {
    return {
      video: this.resultsVideo,
      videoHighScore: this.highScoreVideoResults,
      bySong: this.resultsBySong,
      image: this.resultsImage,
      imageHighScore: this.highScoreImageResults,
      imagePaginated: this.resultsImagePaginated
    };
  }

  get tagsArray() {
    return Object.fromEntries(
      Object.entries(this.selectedSearchResult?._tags || {})
        .filter(([key]) => !key.toLowerCase().includes("llava"))
    );
  }

  ToggleLoadingSearch = () => {
    this.loadingSearch = !this.loadingSearch;
  };

  ToggleLoadingSearchResult = () => {
    this.loadingSearchResult = !this.loadingSearchResult;
  };

  ToggleMusicSetting = () => {
    this.musicSettingEnabled = !this.musicSettingEnabled;
  };

  SetSelectedSearchResult = ({result}) => {
    this.selectedSearchResult = result;
  };

  SetPagination = ({page}) => {
    this.endResult = (page * this.pageSize);
    this.startResult = this.endResult - this.pageSize;
    this.currentPage = page;
  };

  UpdateSelectedSearchResult = ({key, value}) => {
    this.selectedSearchResult[key] = value;
  };

  SetCurrentSearchResults = ({results, type="IMAGE"}) => {
    if(type === "IMAGE") {
      this.resultsImage = null;
      this.resultsImage = results;
    } else if(type === "VIDEO") {
      this.resultsVideo = null;
      this.resultsVideo = results;
    }
  };

  SetCurrentSearch = ({
    resultsBySong,
    videoResults,
    imageResults,
    index,
    terms,
    highScoreVideoResults,
    highScoreImageResults,
    resultsViewType,
    resultsImagePaginated,
    resultsVideoPaginated
  }) => {
    this.highScoreImageResults = highScoreImageResults;
    this.highScoreVideoResults = highScoreVideoResults;
    this.currentSearch.resultsBySong = {...resultsBySong};
    this.currentSearch.index = index;
    this.currentSearch.terms = terms;
    this.resultsVideo = videoResults;
    this.resultsImage = imageResults;
    this.resultsViewType = resultsViewType;
    this.resultsImagePaginated = resultsImagePaginated;
    this.resultsVideoPaginated = resultsVideoPaginated;
  };

  SetSearchIndex = ({index}) => {
    this.currentSearch.index = index;
  };

  SetSearchHostname = ({host="ai.contentfabric.io"}) => {
    this.searchHostname = host;
  };

  SetSearchSummaryType = ({type}) => {
    this.searchSummaryType = type;
  };

  SetCustomIndex = ({index}) => {
    this.customIndex = index;
  };

  SetSearchFields = ({fields}) => {
    this.currentSearch.searchFields = fields;
  };

  SetSearchContentType = ({type}) => {
    this.searchContentType = type;
  };

  SetResultsViewType = ({value}) => {
    this.resultsViewType = value;
  };

  UpdatePageSize = flow(function * ({pageSize}) {
    this.ResetPagination();
    this.ResetSearch();

    this.pageSize = pageSize;

    yield this.GetNextPageResults({
      fuzzySearchValue: this.currentSearch.terms,
      page: 1
    });
  });

  GetNextPageResults = flow(function * ({fuzzySearchValue, page, cacheResults=true}) {
    const fuzzySearchFields = [];
    Object.keys(this.currentSearch.searchFields || {}).forEach(field => {
      if(this.currentSearch.searchFields[field].value) {
        fuzzySearchFields.push(field);
      }
    });

    yield this.GetSearchResults({
      fuzzySearchValue,
      fuzzySearchFields,
      musicType: "all",
      page,
      cacheResults
    });
  });

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

      // Fields for all tenants that are not configured in the meta
      ["movie_characters"].forEach(field => {
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
    searchContentType
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
            max_total: searchPhrase ? 30 : -1
          };

          if(!searchPhrase) {
            queryParams["sort"] = "f_music";
          }
        }
      } else {
        // Regular search
        const desiredTotalResults = searchPhrase ? 100 : -1;
        const maxTotal = this.pagination.currentPage === 1 ? desiredTotalResults : this.pagination.endResult;
        const upperLimit = this.pagination.endResult;

        queryParams = {
          terms: searchPhrase,
          search_fields: searchFields.join(","),
          start: this.pagination.startResult,
          limit: upperLimit,
          display_fields: "all",
          clips: searchContentType === "IMAGES" ? false : true,
          clips_include_source_tags: true,
          debug: true,
          // clips_max_duration: 55,
          max_total: maxTotal,
          select: "/public/asset_metadata/title,/public/name,public/asset_metadata/display_title"
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
      const newUrl = `https://${this.searchHostname}/search/${contentObject}`.concat(url.slice(_pos));
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
      resultsBySong: null,
      videoResults: null,
      imageResults: null,
      highScoreResults: null,
      index: this.currentSearch.index,
      terms: this.currentSearch.terms,
      resultsViewType: "ALL",
      resultsImagePaginated: null
    });

    this.ResetPagination();
  };

  ResetPagination = () => {
    this.pageSize = 35;
    this.searchTotal = null;
    this.startResult = 0;
    this.endResult = null;
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
    }

    return highScore ? (highScore * 100).toFixed(1) : "";
  };

  ParseResults = flow(function * ({url, searchContentType, page}) {
    try {
      let videoResults, imageResults, resultsBySong;
      let results = yield this.client.Request({url});
      let editedContents;

      if(page === 1) {
        this.searchTotal = results.pagination?.total;
      }

      editedContents = yield Promise.all(
        (results.contents || results.results).map(async (result, i) => {
          let url;

          if(searchContentType === "IMAGES") {
            result["_score"] = this.GetSearchScore({score: result.score});
            result["_assetType"] = true;

            url = await this.rootStore.GetFilePath({
              objectId: result.id,
              path: result.prefix
            });

            result["_imageSrc"] = url;
            result["_prefix"] = result.prefix;
            result["_title"] = result.prefix.replace("/assets/", "");
            result["_captionApproved"] = await summaryStore.GetCaptionApprovalState({
              objectId: result.id,
              prefix: result.prefix,
              cache: false
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
            result["_title"] = result.meta?.public?.asset_metadata?.title || result.meta?.public?.name || result.id;
          }

          result["_index"] = i;
          // Cache index within total results
          result["_indexTotalRes"] = (i + 1) + ((page - 1) * this.pagination.pageSize);

          return result;
        })
      );

      if(searchContentType === "IMAGES") {
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

      const highScoreResults = (results.contents || results.results || [])
        .filter(item => {
        return (parseInt(item._score || "") >= this.highScore) || [null, undefined, ""].includes(item._score);
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
    cacheResults=true,
    page=1
  }) {
    let objectId, versionHash, imageUrl, videoUrl, imageResults, videoResults, resultsBySong, highScoreImage, highScoreVideo, resultsViewType, newResultsVideoPaginated, newResultsImagePaginated;
    const indexValue = this.customIndex || this.currentSearch.index;

    if(indexValue.startsWith("hq__")) {
      versionHash = indexValue;
    } else if(indexValue.startsWith("iq__")) {
      objectId = indexValue;
    }

    // Determine whether index is asset type
    const {searchAssetType} = yield this.GetSearchParams({
      objectId
    });

    if(page === 1 && !searchAssetType) {
      this.pageSize = 20;
    }

    this.SetSearchContentType({type: searchAssetType ? "IMAGES" : "VIDEOS"});

    this.SetPagination({page});

    const ImageRequest = this.CreateVectorSearchUrl({
      objectId,
      versionHash,
      searchPhrase: fuzzySearchValue,
      searchFields: fuzzySearchFields,
      musicType: musicType,
      searchContentType: "IMAGES"
    });

    const VideoRequest = this.CreateVectorSearchUrl({
      objectId,
      versionHash,
      searchPhrase: fuzzySearchValue,
      searchFields: fuzzySearchFields,
      musicType: musicType,
      searchContentType: "VIDEOS"
    });

    if(this.searchContentType === "IMAGES") {
      imageUrl = yield ImageRequest;
      ({imageResults, highScoreResults: highScoreImage} = yield this.ParseResults({
        url: imageUrl.url,
        searchContentType: "IMAGES",
        page
      }));

      resultsViewType = ((highScoreImage || []).length > 0 && fuzzySearchValue) ? "HIGH_SCORE" : "ALL";

      newResultsImagePaginated = Object.assign({}, this.resultsImagePaginated);
      newResultsImagePaginated[page] = imageResults?.contents;
    } else if(this.searchContentType === "VIDEOS") {
      videoUrl = yield VideoRequest;
      ({videoResults, resultsBySong, highScoreResults: highScoreVideo} = yield this.ParseResults({
        url: videoUrl.url,
        searchContentType: "VIDEOS",
        page
      }));

      // this.totalResults = videoResults.pagination?.total;
      resultsViewType = (highScoreVideo || []).length > 0 ? "HIGH_SCORE" : "ALL";

      newResultsVideoPaginated = Object.assign({}, this.resultsVideoPaginated);
      newResultsVideoPaginated[page] = videoResults?.contents;
    }

    if(cacheResults) {
      this.SetCurrentSearch({
        videoResults: videoResults?.contents,
        imageResults: imageResults?.contents,
        resultsBySong,
        highScoreImageResults: highScoreImage,
        highScoreVideoResults: highScoreVideo,
        index: objectId,
        terms: fuzzySearchValue,
        resultsViewType,
        resultsVideoPaginated: newResultsVideoPaginated,
        resultsImagePaginated: newResultsImagePaginated
      });
    }
  });

  GetShareUrls = flow(function * () {
    const embedUrl = yield this.client.EmbedUrl({
      objectId: this.selectedSearchResult.id,
      options: {
        clipStart: this.selectedSearchResult.start_time / 1000,
        clipEnd: this.selectedSearchResult.end_time / 1000,
        verifyContent: true
      }
    });
    const {id: objectId, start_time: startTime, end_time: endTime, qlib_id: libraryId, _assetType, prefix} = this.selectedSearchResult;
    let downloadUrl;

    if(_assetType) {
      downloadUrl = yield this.rootStore.GetDownloadUrlImage({
        libraryId,
        objectId,
        prefix
      });
    } else {
      downloadUrl = yield this.rootStore.GetDownloadUrlWithMaxResolution({objectId, startTime, endTime, libraryId});
    }

    return {
      embedUrl,
      downloadUrl
    };
  });

  GetTitleInfo = flow(function * () {
    const result = this.selectedSearchResult;
    const libraryId = result.qlib_id;
    const objectId = result.id;

    if(this.musicSettingEnabled) { return; }

    if(result._assetType) {
      // Set image info
      const meta = yield this.client.ContentObjectMetadata({
        objectId,
        libraryId,
        metadataSubtree: `${result._prefix}/display_metadata`,
        select: CAPTION_KEYS.map(item => item.keyName)
      });

      this.UpdateSelectedSearchResult({
        key: "_info_image",
        value: {
          ...meta
        }
      });
    } else {
      // Set video info

      // TODO: Replace Canal's metadat with display_metadata
      let meta = yield this.client.ContentObjectMetadata({
        objectId,
        libraryId,
        metadataSubtree: "/public/asset_metadata",
        select: [
          "title",
          "info/add_ons/Synopsis",
          "info/duration",
          "info/genre",
          "info/language",
          "info/talent/Acteur", // Actors
          "info/talent/Producteur", // Producer
          "info/talent/Réalisateur", // Director
          "info/talent/Scénariste", // Screenwriter
          "info/year_of_production"
        ]
      });

      if(meta?.info) {
        const SortedArray = ({data=[], commaSeparated=false}) => {
          const sorted = data
            .sort((a, b) => a.order_in_function - b.order_in_function)
            .map(i => `${i.first_name} ${i.last_name}`);

          if(commaSeparated) {
            return sorted.join(", ");
          } else {
            return sorted;
          }
        };

        const directorDisplay = SortedArray({data: meta?.info?.talent?.Réalisateur, commaSeparated: true});

        const writerDisplay = SortedArray({data: meta?.info?.talent?.Scénariste, commaSeparated: true});
        const actorDisplay = SortedArray({data: meta?.info?.talent?.Acteur
      }).slice(0, 5).join(", ");

        const synopsisDisplay = (meta?.info?.add_ons?.Synopsis || [])
          .filter(i => i.language_iso_code === "GBR")
          .map(i => i.content)
          .join("");

        this.UpdateSelectedSearchResult({
          key: "_info_video",
          value: {
            ...meta?.info,
            _standard: false,
            title: meta?.title,
            synopsisDisplay,
            directorDisplay,
            writerDisplay,
            actorDisplay
          }
        });
      } else {
        const infoData = {};
        meta = yield this.client.ContentObjectMetadata({
          objectId,
          libraryId,
          metadataSubtree: "public/display_metadata"
        });

        Object.keys(meta || {}).forEach(objectKey => {
          const value = meta[objectKey];

          if(Array.isArray(value) && typeof value[0] === "string") {
            infoData[objectKey] = value.join(", ");
          } else if(["string", "number"].includes(typeof value)) {
            infoData[objectKey] = value;
          }
        });

        this.UpdateSelectedSearchResult({
          key: "_info_video",
          value: {
            ...infoData,
            _standard: true
          }
        });
      }
    }
  });
}

export default SearchStore;
