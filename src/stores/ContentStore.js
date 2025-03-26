import {flow, makeAutoObservable} from "mobx";

// Store for managing content object
class ContentStore {
  rootFolderId;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

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
        "public/name",
        "public/asset_metadata/display_title"
      ],
      sort: {
        field: sortBy
      }
    });

    const content = data.versions || [];

    yield this.client.utils.LimitedMap(
      10,
      content,
      async contentObject => {
        let tags, permission;
        const objectId = contentObject.id;

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

        return contentObject;
      }
    );

    return content;
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
