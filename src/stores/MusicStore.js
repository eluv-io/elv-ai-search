import {makeAutoObservable} from "mobx";

// Store for handling music queries
class MusicStore {
  musicSettingEnabled = false;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  ToggleMusicSetting = () => {
    this.musicSettingEnabled = !this.musicSettingEnabled;
  };
}

export default MusicStore;
