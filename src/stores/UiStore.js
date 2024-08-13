// Class that handles main visual treatments
import {makeAutoObservable} from "mobx";

class UiStore {
  rootStore;
  theme = "light";

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  SetTheme = ({theme}) => {
    this.theme = theme;
  };
}

export default UiStore;
