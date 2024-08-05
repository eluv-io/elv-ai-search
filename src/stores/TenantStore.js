// Store for retrieving/caching tenant-level metadata
import {makeAutoObservable} from "mobx";

class TenantStore {
  rootStore;

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

  LoadTenantData = () => {
    try {
      return this.client.userProfileClient.TenantContractId();
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw Error("No tenant contract ID found.");
    }
  };

  LoadTenantIndexes = () => {
    if(!this.tenantId) {
      return [];
    }

    return this.client.ContentObjectMetadata({
      libraryId: this.tenantId.replace("iten", "ilib"),
      objectId: this.tenantId.replace("iten", "iq__"),
      metadataSubtree: "public/search/indexes"
    });
  };
}

export default TenantStore;
