import {flow, makeAutoObservable} from "mobx";
import {ORG_TAGS} from "@/utils/constants.js";

// Store for managing content object
class ContentStore {
  contentObjects = new Map();
  contentFolders = new Map();
  // Caches original order of content objects
  orderedContentObjectIds = [];
  // Caches original order of content folders
  orderedContentFolderIds = [];
  paging = {};
  loading = false;

  // ---- Navigation ------------------------------
  // Stores the currently navigated folder
  contentFolder;

  // ---- Pagination ------------------------------
  pageSize = 20;
  totalResults;
  totalPages;
  currentPage = 0;
  // Number of previous pages
  previousPages;
  // Number of next pages
  nextPages;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
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
   * Returns the title of the currently selected content folder.
   *
   * @returns {string} The folder title, or an empty string if no folder is selected.
   */
  get contentFolderName() {
    return this.contentFolder? this.contentFolder._title : "";
  }

  /**
   * Returns the ID of the currently selected content folder.
   *
   * @returns {string | undefined} The folder ID, or undefined if no folder is selected.
   */
  get contentFolderId() {
    return this.contentFolder?.id;
  }

  /**
   * Returns the ID of the currently selected content folder.
   * Falls back to the root folder's object ID if no content folder is selected.
   *
   * @returns {string | undefined} The current folder ID.
   */
  get currentFolderId() {
    return this.contentFolderId || this.rootFolder?.objectId;
  }

  /**
   * An array of content folders derived from the contentFolders map
   *
   * @returns {ContentFolders[]} - Array of content folders
   */
  get contentFolderRecords() {
    if(!this.contentFolders.values() || this.orderedContentFolderIds.length === 0) { return []; }

    return this.orderedContentFolderIds.map(id => this.contentFolders.get(id));
    // return Array.from(this.contentFolders.values());
  }

  /**
   * An array of content objects derived from the contentObjects map
   *
   * @returns {ContentObject[]} - Array of content objects
   */
  get contentObjectRecords() {
    if(!this.contentObjects.values() || this.orderedContentObjectIds.length === 0) { return []; }

    return this.orderedContentObjectIds.map(id => this.contentObjects.get(id));
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
    this.contentFolder = value;
  }

  UpdateOrderedContentObjects(items) {
    items.forEach(item => this.orderedContentObjectIds.push(item.id));
  }

  UpdateOrderedContentFolders(items) {
    items.forEach(item => this.orderedContentFolderIds.push(item.id));
  }

  AddContentObject(id, content) {
    this.contentObjects.set(id, content);
  }

  ResetContentObjects() {
    this.contentObjects.clear();
    this.orderedContentObjectIds = [];
  }

  AddContentFolder(id, content) {
    this.contentFolders.set(id, content);
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

          if(cacheType === "folder") {
            this.AddContentFolder(objectId, contentObject);
          } else if(cacheType === "content") {
            this.AddContentObject(objectId, contentObject);
          }

          return contentObject;
        }
      );

      if(cacheType === "content") {
        this.UpdateOrderedContentObjects(content);
      } else if(cacheType === "folder") {
        this.UpdateOrderedContentFolders(content);
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
