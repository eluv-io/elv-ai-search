import {flow, makeAutoObservable, reaction} from "mobx";
import {ORG_TAGS} from "@/utils/constants.js";
import {GenerateCacheKey, GeneratePaginationCache} from "@/utils/contentHelpers.js";

// Store for managing content object
class ContentStore {
  // Stores content items, organized by folder ID
  contentObjects = {};
  // Stores content folders, organized by parent folder ID
  contentFolders = {};
  // Tracks the original order of content item IDs, organized by folder ID
  orderedContentObjectIds = {};
  // Tracks the original order of folder IDs, organized by parent folder ID
  orderedContentFolderIds = {};
  paging = {};
  loading = false;

  // ---- Current UI State ------------------------
  // Stores the currently navigated folder
  currentFolder = null;
  currentSort = {field: "title", desc: false};
  currentFilter = {};

  // ---- Pagination ------------------------------
  pageSize = 20;
  totalResults;
  totalPages;
  currentPage = 0;
  // Number of previous pages
  previousPages;
  // Number of next pages
  nextPages;

  CACHE_TTL = 5 * 60 * 1000;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

    reaction(
      () => rootStore.tenantStore.rootFolder,
      rootFolder => {
        if(rootFolder) {
          this.currentFolder = rootFolder;
        }
      },
      { fireImmediately: true }
    );
  }

  get client() {
    return this.rootStore.client;
  }

  /**
   * Returns the root folder object from the tenant store.
   * Typically corresponds to 'content_folder_root' in the Properties library.
   *
   * @returns {Object} - The root folder if set.
   */
  get rootFolder() {
    return this.rootStore.tenantStore.rootFolder;
  }

  /**
   * Returns the ID of the currently selected content folder.
   * Will be root folder ID when no folder is selected.
   *
   * @returns {string | undefined} The current folder ID.
   */
  get currentFolderId() {
    return this.currentFolder?.objectId;
  }

  /**
   * Returns the title of the currently selected content folder.
   *
   * @returns {string} The folder title, or an empty string if no folder is selected.
   */
  get contentFolderName() {
    return this.currentFolder? this.currentFolder._title : "";
  }

  /**
   * An array of content folders derived from the contentFolders map
   *
   * @returns {ContentFolders[]} - Array of content folders
   */
  get contentFolderRecords() {
    if(!this.currentFolderId || this.loading) { return []; }

    const orderedItemIds = this.orderedContentFolderIds[this.currentFolderId];
    if(!orderedItemIds) { return []; }

    const currentFolder = this.contentFolders[this.currentFolderId];
    if(!currentFolder || Object.keys(currentFolder || {}).length === 0) { return []; }

    return orderedItemIds.map(itemId => currentFolder[itemId]);
  }

  /**
   * An array of content objects derived from the contentObjects map
   *
   * @returns {ContentObject[]} - Array of content objects
   */
  get contentObjectRecords() {
    if(!this.currentFolderId || this.loading) { return []; }

    const cacheKey = GenerateCacheKey({
      folderId: this.currentFolderId,
      sortBy: this.currentSort,
      // TODO: Additional filter options
      filter: {}
    });
    console.log("cache key", cacheKey)

    const orderedItemIds = this.orderedContentObjectIds[cacheKey];
    if(!orderedItemIds) { return []; }

    const currentFolder = this.contentObjects[cacheKey];
    console.log("this.contentObjects", this.contentObjects)
    if(!currentFolder || Object.keys(currentFolder || {}).length === 0) { return []; }
    console.log("currentFolder", currentFolder)

    return orderedItemIds.map(itemId => currentFolder?.items[itemId]);
  }

  get pagination() {
    return {
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalResults: this.totalResults,
      previousPages: this.previousPages,
      nextPages: this.nextPages,
    };
  }

  UpdateContentFolder(value) {
    this.currentFolder = value;
  }

  UpdateContentObjectItems({items, cacheKey, pagination}) {
    const itemIds = items.map(item => item.id);
    this.orderedContentObjectIds[cacheKey] = [...this.orderedContentObjectIds[cacheKey] || [], ...itemIds];

    let currentFolderMap = {};

    items.forEach(item => {
      currentFolderMap[item.id] = item;
    });

    const fetchedPages = this.contentObjects[cacheKey]?.fetchedPages || [];

    // Offset-based pagination
    fetchedPages.push(pagination.currentStartIndex);

    this.contentObjects[cacheKey] = {
      items: {
        ...this.contentObjects[cacheKey] || {},
        ...currentFolderMap
      },
      pagination,
      fetchedPages,
      lastFetched: Date.now()
    };
    console.log("content objects", this.contentObjects)
  }

  UpdateContentFolderItems(items=[], folderId) {
    const itemIds = items.map(item => item.id);
    this.orderedContentFolderIds[folderId] = itemIds;

    let currentFolderMap = {};
    items.forEach(item => {
      currentFolderMap[item.id] = item;
    });

    this.contentFolders[folderId] = currentFolderMap;
  }

  ResetContentObjects() {
    this.contentObjects.clear();
    this.orderedContentObjectIds = [];
  }

  ResetContentFolders() {
    this.contentFolders.clear();
  }

  ToggleLoading() {
    this.loading = !this.loading;
  }

  SetPaging(value) {
    this.paging = value;
  }

  GetContentData = flow(function * ({
    filterOptions={}, // {types: mez, live_stream, master, index, folder, group: groupID}
    sortOptions, // {field: string, desc: boolean}
    start,
    limit,
    cacheType // folder, content
  }) {
    try {
      const parentFolderId = this.currentFolderId;

      const cacheKey = GenerateCacheKey({
        folderId: parentFolderId,
        sortBy: this.currentSort,
        // TODO: Additional filter options
        filter: {}
      });
      console.log("key", cacheKey)

      const cachedObject = this.contentObjects[cacheKey];
      console.log("cached object", cachedObject)

      if(
        cachedObject &&
        (new Date() - (cachedObject.lastFetched || 0)) <= this.CACHE_TTL
      ) {
        return this.contentObjects[cacheKey];
      }

      this.ToggleLoading();

      const filter = [];

      if(filterOptions.group) {
        filter.push(`group:eq:${filterOptions.group}`);
      }

      (filterOptions.types || []).forEach(type => {
        filter.push(`tag:eq:${ORG_TAGS[type]}`);
      });

      const data = yield this.client.TenantContent({
        filter,
        sortOptions,
        start,
        limit
      });

      const content = data.versions || [];

      yield this.client.utils.LimitedMap(
        10,
        content,
        async (contentObject, i) => {
          let tags, queryFields;

          const objectId = contentObject.id;

          try {
            tags = await this.GetContentTags({
              objectId
            });
          } catch(error) {
            console.error(`Skipping tag for ${objectId}`);
          }

          try {
            queryFields = await this.GetQueryFields({
              objectId
            });
          } catch(error) {
            console.error(`Skipping query fields for ${objectId}`);
          }

          contentObject["_tags"] = tags;
          contentObject["_queryFields"] = queryFields;
          contentObject["_isFolder"] = (tags || []).includes("elv:folder");
          contentObject["_title"] = queryFields?.title;
          // Flags for distinguishing between clips, non-clips, images
          contentObject["_clipType"] = false;
          contentObject["_contentType"] = true;
          // Index used for clip navigation
          contentObject["_index"] = i;

          return contentObject;
        }
      );
      console.log("paging", data.paging)
      const pagination = GeneratePaginationCache(data.paging);
      console.log("pagination", pagination)
      console.log("CONTENT", content)

      if(cacheType === "content") {
        this.UpdateContentObjectItems({
          items: content,
          cacheKey,
          pagination
        });
      } else if(cacheType === "folder") {
        this.UpdateContentFolderItems(content, parentFolderId);
      }

      this.SetPaging(data.paging);
      this.ToggleLoading();

      return {
        content,
        paging: data.paging
      };
    } catch(error) {
      console.error("Unable to load content", error);
      throw error;
    }
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
        objectId,
        versionHash
      });
    } catch(error) {
      console.error(`Unable to get tags for ${objectId}`, error);
      return [];
    }
  });

  GetQueryFields = flow(function * ({
    libraryId,
    objectId,
    versionHash
  }) {
    try {
      if(!libraryId) {
        libraryId = yield this.client.ContentObjectLibraryId({objectId, versionHash});
      }

      return this.client.ContentQueryFields({
        libraryId,
        objectId,
        versionHash
      });
    } catch(error) {
      console.error(`Unable to get query fields for ${objectId}`, error);
      return {};
    }
  });

  CreateContentFolder = flow(function * ({
    libraryId,
    name,
    displayTitle,
    tags,
    queryFields,
    groupIds=[]
  }){
    try {
      const {objectId, writeToken} = yield this.client.CreateContentFolder({
        libraryId,
        name,
        displayTitle,
        tags,
        queryFields
      });

      yield this.client.AddContentObjectFolders({
        libraryId,
        objectId,
        writeToken,
        groupIds
      });

      yield this.client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
        commitMessage: "Create content group"
      });
    } catch(error) {
      console.error("Unable to create content folder", error);
      throw error;
    }
  });

  UpdateContentName = flow(function * ({
    libraryId,
    objectId,
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
        metadataSubtree: "public/name",
        metadata: value
      });

      yield this.client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
        commitMessage: "Update name"
      });
    } catch(error) {
      console.error(`Unable to update metadata for ${objectId}`, error);
    }
  });
}

export default ContentStore;
