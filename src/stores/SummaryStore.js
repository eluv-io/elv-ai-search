import {flow, makeAutoObservable} from "mobx";

// Store for managing clip generated summaries
class SummaryStore {
  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  GetSummaryResults = flow(function * () {});
}

export default SummaryStore;
