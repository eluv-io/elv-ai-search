import {flow, makeAutoObservable} from "mobx";

// Store for managing content object
class ContentStore {
  rootFolderId;

  // Pagination
  pageSize = 20;
  totalResults;
  totalPages;
  currentPage = 0;
  previousPages; // Number of previous pages
  nextPages; // Number of next pages

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  get pagination() {
    // const currentPage = this.endResult / this.pageSize;
    // const searchTotal = this.resultsViewType === "HIGH_SCORE" ? this.searchResults?.length : this.searchTotal;
    // const totalResultsPerPage = searchTotal;
    // const totalPages = Math.ceil(searchTotal / this.pageSize);

    return {
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalResults: this.totalResults,
      previousPages: this.previousPages,
      nextPages: this.nextPages,
      // startResult: this.startResult,
      // endResult: this.endResult,
      // Calculated values
      // totalResultsPerPage, // total for current page
      // searchTotal,
      // firstResult: this.startResult + 1,
      // lastResult: Math.min(searchTotal, this.endResult)
    };
  }

  UpdatePageSize = flow(function * ({pageSize}) {
    this.ResetPagination();
    // this.ResetSearch();

    this.pageSize = pageSize;

    // yield this.GetNextPageResults({
    //   fuzzySearchValue: this.currentSearch.terms,
    //   page: 1
    // });
  });

  GetContentData = flow(function * ({
    parentFolder,
    filterByFolder=true,
    sortBy="asset_type"
  }={}) {
    const filterOptions = [];

    if(filterByFolder) {
      filterOptions.push("tag:eq:elv:folder");
    }

    if(parentFolder) {
      filterOptions.push(`group:eq:${parentFolder}`);
    }

    const data = yield this.client.TenantContent({
      filter: filterOptions,
      select: [
        "commit/timestamp",
        "public/name",
        "public/asset_metadata/display_title",
        "offerings/default/media_struct/streams/video/duration/float",
        "offerings/default/media_struct/streams/audio/duration/float"
      ],
      sort: {
        field: sortBy
      }
    });
    console.log("data", data)

    const content = data.versions || [];

    yield this.client.utils.LimitedMap(
      10,
      content,
      async contentObject => {
        let tags, permission;
        const objectId = contentObject.id;
        const duration = contentObject.meta?.offerings?.default?.media_struct?.streams?.video?.duration?.float || contentObject.meta?.offerings?.default?.media_struct?.streams?.audio?.duration?.float;

        try {
          tags = await this.GetContentTags({
            objectId
          });
        } catch(error) {
          console.error(`Skipping tag for ${objectId}`);
        }

        try {
          permission = await this.client.Permission({objectId});
        } catch(error) {
          console.error(`Skipping permission for ${objectId}`);
        }

        contentObject["_tags"] = tags;
        contentObject["_isFolder"] = (tags || []).includes("elv:folder");
        contentObject["_permission"] = permission;
        contentObject["_duration"] = duration;

        return contentObject;
      }
    );

    return {
      content,
      paging: data.paging
    };
  });

  GetContentTags = flow(function * ({
    libraryId,
    objectId,
    versionHash
  }) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId, versionHash});
      }

      return this.client.ContentTags({
        libraryId,
        objectId
      });
    } catch(error) {
      console.error(`Unable to get tags for ${objectId}`, error);
      return [];
    }
  });
}

export default ContentStore;
