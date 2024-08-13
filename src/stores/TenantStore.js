import {flow, makeAutoObservable} from "mobx";

// Store for retrieving/caching tenant-level metadata
class TenantStore {
  rootStore;
  searchIndexes;
  loadedIndexes = false;

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
}

export default TenantStore;
