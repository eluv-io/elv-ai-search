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

  GetContentFolders = flow(function * ({parentFolder}={}) {
    const data = yield this.client.TenantContent({
      filter: [
        "tag:eq:elv:folder",
        `group:eq:${parentFolder}`
      ],
      select: ["public/name", "public/asset_metadata/display_title"],
      sort: {field: "asset_type"}
    });

    const content = data.versions || [];

    yield this.client.utils.LimitedMap(
      10,
      content,
      async contentObject => {
        const tags = await this.GetContentTags({
          objectId: contentObject.id
        });

        contentObject["_tags"] = tags;
        contentObject["_isFolder"] = tags.includes("elv:folder");
        contentObject["_permission"] = await this.client.Permission({objectId: contentObject.id});

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
    if(!libraryId) {
      libraryId = yield this.client.ContentObjectLibraryId({objectId, versionHash});
    }

    return this.client.ContentTags({
      libraryId,
      objectId
    });
  });
}

export default ContentStore;
