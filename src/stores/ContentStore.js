import {flow, makeAutoObservable} from "mobx";
import {ORG_TAGS} from "@/utils/constants.js";

// Store for managing content object
class ContentStore {
  contentObjects = {};
  contentFolders = {};
  contentLoaded = false;

  // Navigation
  contentFolder; // stores the currently navigated folder

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

  // Stores content_folder_root in Properties library
  get rootFolder() {
    return this.rootStore.tenantStore.rootFolder;
  }

  get contentFolderName() {
    return this.contentFolder? this.contentFolder._title : "";
  }

  get contentFolderId() {
    return this.contentFolder?.id;
  }

  get currentFolderId() {
    return this.contentFolderId || this.rootFolder?.objectId;
  }

  get contentFolderRecords() {
    return Object.values(this.contentFolders || {});
  }

  get contentObjectRecords() {
    return Object.values(this.contentObjects || {});
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

  UpdateContentFolder = (value) => {
    this.contentFolder = value;
  };

  GetContentData = flow(function * ({
    filterOptions={}, // {types: mez, live_stream, master, index, folder, group: groupID}
    sortOptions, // {field: string, desc: boolean}
    start,
    limit,
    cacheType // folder, content
  }) {
    const filter = [];

    if(filterOptions.group) {
      filter.push(`group:eq:${filterOptions.group}`);
    }

    (filterOptions.types || []).forEach(type => {
      filter.push(`tag:eq:${ORG_TAGS[type]}`);
    });

    // TODO: Sort with folders first
    const data = yield this.client.TenantContent({
      filter,
      select: [
        "public/name"
      ],
      sortOptions,
      start,
      limit
    });

    const content = data.versions || [];
    let contentObjects = {};
    let contentFolders = {};

    yield this.client.utils.LimitedMap(
      10,
      content,
      async (contentObject, i) => {
        let tags, queryFields, permission;

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

        try {
          permission = await this.client.Permission({objectId});
        } catch(error) {
          console.error(`Skipping permission for ${objectId}`);
        }

        contentObject["_tags"] = tags;
        contentObject["_queryFields"] = queryFields;
        contentObject["_isFolder"] = (tags || []).includes("elv:folder");
        contentObject["_permission"] = permission;
        contentObject["_title"] = contentObject.meta?.public?.name || contentObject.id;
        // Flags for distinguishing between clips, non-clips, images
        contentObject["_clipType"] = false;
        contentObject["_contentType"] = true;
        // Index used for clip navigation
        contentObject["_index"] = i;

        if(cacheType === "folder") {
          contentFolders[objectId] = contentObject;
        } else if(cacheType === "content") {
          contentObjects[objectId] = contentObject;
        }

        return contentObject;
      }
    );

    if(cacheType === "folder") {
      this.contentFolders = contentFolders;
    } else if(cacheType === "content") {
      this.contentObjects = contentObjects;
    }

    this.contentLoaded = true;

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
      return {};
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
