import {flow, makeAutoObservable} from "mobx";
import {uiStore} from "@/stores/index.js";

// Store for retrieving/caching tenant-level metadata
class TenantStore {
  rootStore;
  searchIndexes;
  loadedIndexes = false;
  libraries;
  rootFolder;
  tenantName;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  get tenantId() {
    return this.rootStore.tenantId;
  }

  GetTenantId = () => {
    try {
      return this.client.userProfileClient.TenantContractId();
    } catch(error) {
      uiStore.SetErrorMessage("Unable to determine tenant info");
      // eslint-disable-next-line no-console
      console.error(error);
      throw Error("No tenant contract ID found.");
    }
  };

  GetTenantData = flow(function * () {
    if(!this.tenantId) {
      return [];
    }

    if(this.loadedIndexes && this.rootFolder) {
      return Object.values(this.searchIndexes || {});
    }

    const tenantMeta = yield this.client.ContentObjectMetadata({
      libraryId: this.tenantId.replace("iten", "ilib"),
      objectId: this.tenantId.replace("iten", "iq__"),
      metadataSubtree: "public",
      select: [
        "search/indexes",
        "content_folder_root",
        "name"
      ]
    });

    const indexes = tenantMeta?.search?.indexes;

    if(tenantMeta?.name) {
      this.tenantName = tenantMeta.name;
    }

    if(!indexes) {
      uiStore.SetErrorMessage("Unable to determine search indexes for tenant");
    }

    if(!this.searchIndexes) {
      // Cache search indexes for later reference
      this.searchIndexes = {};

      (indexes || []).forEach(index => {
        this.searchIndexes[index.id] = index;
      });
    }

    this.loadedIndexes = true;
    this.rootFolder = tenantMeta?.content_folder_root;

    return {
      indexes: indexes || [],
      contentFolderRoot: tenantMeta?.content_folder_root
    };
  });

  GetLibraries = flow(function * (){
    try {
      if(!this.libraries) {
        this.libraries = {};

        let loadedLibraries = {};

        const libraryIds = yield this.client.ContentLibraries() || [];

        yield Promise.all(
          libraryIds.map(async libraryId => {
            let response;
            try {
              response = (await this.client.ContentObjectMetadata({
                libraryId,
                objectId: libraryId.replace(/^ilib/, "iq__"),
                select: [
                  "public/name"
                ]
              }));
            } catch(error) {
              // eslint-disable-next-line no-console
              console.error(`Unable to load metadata for ${libraryId}`);
            }

            if(!response) { return; }

            loadedLibraries[libraryId] = {
              libraryId,
              name: response.public?.name || libraryId
            };

          })
        );

        // eslint-disable-next-line no-unused-vars
        const sortedArray = Object.entries(loadedLibraries).sort(([id1, obj1], [id2, obj2]) => obj1.name.localeCompare(obj2.name));
        this.libraries = Object.fromEntries(sortedArray);
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load libraries", error);
    }
  });

  GetObjects = flow(function * ({libraryId}) {
    try {
      const loadedObjects = {};
      const objectList = yield this.client.ContentObjects({libraryId});

      yield Promise.all(
        (objectList?.contents || []).map(async objectData => {
          let response;
          try {
            response = await this.client.ContentObjectMetadata({
              libraryId,
              objectId: objectData.id,
              select: [
                "public/name"
              ]
            });
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(`Unable to load metadata for ${libraryId}`);
          }

          if(!response) { return; }

          loadedObjects[objectData.id] = {
            objectId: objectData.id,
            name: response.public?.name || objectData.id
          };
        })
      );

      // eslint-disable-next-line no-unused-vars
      const sortedArray = Object.entries(loadedObjects).sort(([id1, obj1], [id2, obj2]) => obj1.name.localeCompare(obj2.name));

      return Object.fromEntries(sortedArray);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load objects", error);
    }
  });
}

export default TenantStore;
