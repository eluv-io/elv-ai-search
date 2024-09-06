import {makeAutoObservable, flow} from "mobx";
import {ASSETS_SEARCH_FIELDS} from "@/utils/constants.js";

// Store for fetching search results
class SearchStore {
  searchV1Node;
  searchV2Node;
  currentSearch = {
    results: null,
    resultsBySong: null,
    index: "",
    terms: ""
  };
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

  SetCurrentSearch = ({results, resultsBySong, index, terms}) => {
    this.currentSearch.results = {...results};
    this.currentSearch.resultsBySong = {...resultsBySong};
    this.currentSearch.index = index;
    this.currentSearch.terms = terms;
  };

  SetSearchIndex = ({index}) => {
    this.currentSearch.index = index;
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
    musicType
  }) {
    try {
      const libraryId = yield this.client.ContentObjectLibraryId({objectId});

      let queryParams, server;

      if(this.musicSettingEnabled) {
        server = "ai";
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
            sort: "f_music",
            clips: true,
            clips_include_source_tags: true,
            max_total: 30
          };
        }
      } else {
        server = "ai";
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

  ResetSearch = () => {
    this.SetCurrentSearch({
      results: null,
      index: this.currentSearch.index,
      terms: this.currentSearch.terms
    });
  };

  GetCoverImage = flow(function * ({song, queryParams}) {
    try {
      const libraryId = "ilib4HSA426GHsGHpVAagjhsDkZhgdCz";
      const objectId = "iq__3MmY78ZgtY4wXxMQMtqUWqnxy2kR";

      const Sha1 = async (string) => {
        const digest = await (crypto.subtle || crypto.webcrypto.subtle).digest("SHA-1", new TextEncoder().encode(string));
        const res = [...new Uint8Array(digest)];
        return res.map(x => x.toString(16).padStart(2, "0")).join("");
      };

      const hashname = yield Sha1(song);

      const url = yield this.client.Rep({
        libraryId,
        objectId,
        rep: `image/default/files/covers/${hashname}.png`,
        queryParams
      });

      return url;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to get cover for ${song}`, error);
    }
  });

  ParseTags = flow(function * ({tags={}}){
    const parsedTags = {};

    for(let i = 0; i < Object.keys(tags).length; i++) {
      const tagKey = Object.keys(tags)[i];

      if(tagKey.includes("_tag")) {
        if(tagKey.includes("music")) {
          const tagsArray = yield Promise.all(
            (tags[tagKey] || []).map(async (tag) => {
              const coverUrl = await this.GetCoverImage({
                song: tag.text?.[0],
                queryParams: {
                  width: 50,
                  height: 50
                }
              });

              tag["_coverImage"] = coverUrl;

              return tag;
            })
          );
          parsedTags[tagKey] = tagsArray;
        } else {
          parsedTags[tagKey] = tags[tagKey];
        }
      }
    }

    return parsedTags;
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
    objectId,
    versionHash,
    fuzzySearchValue,
    searchVersion=2,
    vector=true,
    musicType,
    cacheResults=true
  }) {
    const {fuzzySearchFields, searchAssets} = yield this.GetSearchParams({objectId});
    let urlResponse;

    if(vector) {
      urlResponse = yield this.CreateVectorSearchUrl({
        objectId,
        searchPhrase: fuzzySearchValue,
        searchFields: fuzzySearchFields,
        musicType: musicType
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
        (results.contents || results.results).map(async (result, i) => {
          try {
            const base = this.rootStore.networkInfo.name === "main" ?
              "https://main.net955305.contentfabric.io" :
              "https://demov3.net955210.contentfabric.io";
            const fullUrl = new URL(result.image_url, base);

            let url = await this.rootStore.GetThumbnail({
              objectId: result.id,
              imagePath: result.image_url,
              timeSecs: fullUrl?.searchParams?.get("t")
            });
            result["_imageSrc"] = url;
            result["_tags"] = await this.ParseTags({tags: result?.sources?.[0]?.fields});
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

      if(cacheResults) {
        this.SetCurrentSearch({
          results,
          resultsBySong,
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

  GetDownloadUrlWithMaxResolution = flow (function * () {
    const {id: objectId, start_time, end_time, qlib_id: libraryId} = this.selectedSearchResult;
    const clip_start = start_time / 1000;
    const clip_end = end_time / 1000;

    const offerings = yield this.client.ContentObjectMetadata({
      objectId,
      libraryId,
      metadataSubtree: "offerings",
    });
    const offering = offerings["default"];
    const representations = offering.playout.streams.video.representations;
    let playoutKey = null;
    let _max_height = 0;
    let _max_width;
    for (let key in representations) {
      const playout = offering.playout.streams.video.representations[key];
      if (playout.height > _max_height) {
        playoutKey = key;
        _max_height = playout.height;
        _max_width = playout.width;
      }
    }
    const title_name = yield this.client.ContentObjectMetadata({
      objectId,
      libraryId,
      metadataSubtree: "public/name",
    });

    const token = yield this.client.CreateSignedToken({
      objectId,
      duration: 24 * 60 * 60 * 1000,
    });
    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secondsLeft = Math.floor(seconds % 60);

      const paddedHours = String(hours).padStart(2, "0");
      const paddedMinutes = String(minutes).padStart(2, "0");
      const paddedSeconds = String(secondsLeft).padStart(2, "0");

      return `${paddedHours}-${paddedMinutes}-${paddedSeconds}`;
    }
    let _clip_start = formatTime(clip_start);
    let _clip_end = formatTime(clip_end);

    const filename = `Title - ${title_name} (${_max_width}x${_max_height}) (${_clip_start} - ${_clip_end}).mp4`;

    const url = yield this.client.Rep({
      objectId,
      libraryId,
      rep: `media_download/default/${playoutKey}`,
      noAuth: true,
      queryParams: {
        clip_start,
        clip_end,
        authorization: token,
        "header-x_set_content_disposition": `attachment;filename=${filename}`,
      },
    });

    return url;
  });

  GetShareUrls = flow(function * () {
    const embedUrl = yield this.client.EmbedUrl({
      objectId: this.selectedSearchResult.id,
      options: {
        clipStart: this.selectedSearchResult.start_time / 1000,
        clipEnd: this.selectedSearchResult.end_time / 1000
      }
    });

    const downloadUrl = yield this.GetDownloadUrlWithMaxResolution();

    return {
      embedUrl,
      downloadUrl
    };
  });
}

export default SearchStore;
