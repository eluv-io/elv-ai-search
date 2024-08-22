import {flow, makeAutoObservable} from "mobx";

// Store for retrieving/caching tenant-level metadata
class TenantStore {
  rootStore;
  searchIndexes;
  loadedIndexes = false;
  libraries;

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

  GetTenantData = () => {
    try {
      return this.client.userProfileClient.TenantContractId();
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw Error("No tenant contract ID found.");
    }
  };

  GetTenantIndexes = flow(function * () {
    if(!this.tenantId) {
      return [];
    }

    if(this.loadedIndexes) {
      return Object.values(this.searchIndexes || {});
    }

    const indexes = yield this.client.ContentObjectMetadata({
      libraryId: this.tenantId.replace("iten", "ilib"),
      objectId: this.tenantId.replace("iten", "iq__"),
      metadataSubtree: "public/search/indexes"
    });

    if(!this.searchIndexes) {
      // Cache search indexes for later reference
      this.searchIndexes = {};

      (indexes || []).forEach(index => {
        this.searchIndexes[index.id] = index;
      });
    }

    this.loadedIndexes = true;

    return indexes;
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
