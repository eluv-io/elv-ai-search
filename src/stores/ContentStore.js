import {flow, makeAutoObservable} from "mobx";

// Store for managing content object
class ContentStore {
  contentObjects;
  contentFolder;

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

  get rootFolderId() {
    return this.rootStore.tenantStore.rootFolder;
  }

  get contentFolderName() {
    return this.contentFolder? this.contentFolder._title : "";
  }

  get contentFolderId() {
    return this.contentFolder?.id || this.rootStore.tenantStore.rootFolder;
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
    parentFolder,
    filterByTypes=[], // mez, live_stream, master, index, folder
    sortOptions, // {field: string, desc: boolean}
    start,
    limit
  }={}) {
    const filterOptions = [];

    if(parentFolder) {
      filterOptions.push(`group:eq:${parentFolder}`);
    }

    const types = {
      "mez": "elv:vod:mez",
      "master": "elv:vod:master",
      "live_stream": "elv:live_stream",
      "folder": "elv:folder"
    };

    filterByTypes.forEach(type => {
      filterOptions.push(`tag:eq:${types[type]}`);
    });

    // TODO: Sort with folders first
    const data = yield this.client.TenantContent({
      filter: filterOptions,
      select: [
        "commit/timestamp",
        "public/name",
        "public/asset_metadata/display_title",
        "offerings/default/media_struct/duration_rat"
      ],
      sortOptions,
      start,
      limit
    });

    const content = data.versions || [];

    yield this.client.utils.LimitedMap(
      10,
      content,
      async (contentObject, i) => {
        let tags, permission;
        const objectId = contentObject.id;
        const durationArray = contentObject.meta?.offerings?.default?.media_struct?.duration_rat.split("/");
        const duration = durationArray ? (durationArray[0] / durationArray[1]) : null;

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
        contentObject["_title"] = contentObject.meta?.public?.asset_metadata?.display_title || contentObject.meta?.public?.name || contentObject.id;
        contentObject["_clipType"] = false;
        contentObject["_contentType"] = true;
        contentObject["_index"] = i;

        return contentObject;
      }
    );

    this.contentObjects = content;

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
}

export default ContentStore;
