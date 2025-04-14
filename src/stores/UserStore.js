import {flow, makeObservable, observable} from "mobx";

// Store for retrieving information related to user, i.e., profile data, permissions, etc.
class UserStore {
  rootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeObservable({
      rootStore: observable
    });
  }

  get client() {
    return this.rootStore.client;
  }

  GetLibraryPermissions = flow(function *({libraryId}) {
    let canContribute = false, isManager = false;
    const currentAccountAddress = yield this.client.CurrentAccountAddress();
    const owner = yield this.client.ContentLibraryOwner({libraryId});
    const isOwner = this.client.utils.EqualAddress(owner, currentAccountAddress);
    const isContentSpaceLibrary = libraryId === this.rootStore.tenantStore.contentSpace.libraryId;

    if(!isContentSpaceLibrary) {
      const [contributorGroups, userGroups] = yield Promise.all([
        this.GetLibraryGroupAddresses({libraryId, type: "contributor"}),
        this.GetAccessGroupAddresses()
      ]);

      const contractAddress = this.client.utils.HashToAddress(libraryId);
      const canContributeResponse = yield this.client.CallContractMethod({
        contractAddress,
        methodName: "canContribute",
        methodArgs: [
          currentAccountAddress
        ]
      });

      canContribute = (
        isOwner ||
        (contributorGroups.filter(address => userGroups.includes(address))).length > 0 ||
        canContributeResponse
      );
    }

    try {
      isManager = yield this.client.CallContractMethod({
        contractAddress: this.client.utils.HashToAddress(libraryId),
        methodName: "canEdit",
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to call canEdit on ${libraryId}`);
      isManager = isOwner;
    }

    return {
      canContribute,
      owner,
      isOwner,
      isManager,
    };
  });

  GetLibraryGroupAddresses = flow(function *({libraryId, type}) {
    // Get library access groups of the specified type
    let numGroups = yield this.client.CallContractMethod({
      contractAddress: this.client.utils.HashToAddress(libraryId),
      methodName: type + "GroupsLength"
    });

    numGroups = parseInt(numGroups._hex, 16);

    return this.client.utils.LimitedMap(
      10,
      [...Array(numGroups).keys()],
      async i => {
        try {
          return this.client.utils.FormatAddress(
            await this.client.CallContractMethod({
              contractAddress: this.client.utils.HashToAddress(libraryId),
              methodName: type + "Groups",
              methodArgs: [i]
            })
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    );
  });

  GetAccessGroupAddresses = flow(function * () {
    const groups = yield this.client.Collection({collectionType: "accessGroups"});

    return groups
      .map(address => this.client.utils.FormatAddress(address));
  });
}

export default UserStore;
