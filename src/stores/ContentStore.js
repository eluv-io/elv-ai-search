import {flow, makeAutoObservable} from "mobx";

// Store for managing content object
class ContentStore {
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

  GetContentData = flow(function * ({
    parentFolder,
    filterByFolder=true,
    filterExcludeFolder=false,
    sortOptions, // {field: string, desc: boolean}
    start,
    limit
  }={}) {
    const filterOptions = [];

    if(filterByFolder) {
      filterOptions.push("tag:eq:elv:folder");
    }

    if(filterExcludeFolder) {
      filterOptions.push("tag:ne:elv:folder");
    }

    if(parentFolder) {
      filterOptions.push(`group:eq:${parentFolder}`);
    }

    // TODO: Sort with folders first
    const data = yield this.client.TenantContent({
      filter: filterOptions,
      select: [
        "commit/timestamp",
        "public/name",
        "public/asset_metadata/display_title",
        "offerings/default/media_struct/streams/video/duration/float",
        "offerings/default/media_struct/streams/audio/duration/float"
      ],
      sortOptions,
      start,
      limit
    });

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
        contentObject["_title"] = contentObject.meta?.public?.asset_metadata?.display_title || contentObject.meta?.public?.name || contentObject.id;
        contentObject["_clipType"] = false;

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
