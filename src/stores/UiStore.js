// Class that handles main visual treatments
class UiStore {
  rootStore;
  theme = "light";

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  SetTheme = ({theme}) => {
    this.theme = theme;
  };
}

export default UiStore;
