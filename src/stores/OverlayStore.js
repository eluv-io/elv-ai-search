// Class that handles a video overlay for tags
import {flow, makeAutoObservable} from "mobx";
import {FormatName} from "@/utils/helpers.js";

class OverlayStore {
  rootStore;
  trackMap = {};
  overlayEnabled = false;
  enabledOverlayTracks = {};
  trackInfo = {};
  activeTrack;
  entry;
  pageVersion = 0;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get visibleOverlayTracks() {
    return this.activeTrack ?
      { [this.activeTrack]: true} :
      this.enabledOverlayTracks;
  }

  get coordinates() {
    return this.entry ? this.entry.box : {};
  }

  Reset() {
    this.overlayTrack = undefined;
    this.overlayEnabled = false;
  }

  SetActiveTrack = (track) => {
    this.activeTrack = track;
  };

  SetEntry({entry}) {
    this.ResetEntry();
    this.entry = entry;
  }

  ResetEntry() {
    this.entry = null;
  }

  IncrementPageVersion(){
    this.pageVersion = this.pageVersion + 1;
  }

  TrackInfo = (trackKey) => {
    if(!this.trackInfo[trackKey]) {
      const track = this.rootStore.trackStore.tracks
        .filter(track => track.trackType === "metadata")
        .find(track => track.key === trackKey);

      if(track) {
        this.trackInfo[trackKey] = {label: track.label, color: track.color};
      } else {
        this.trackInfo[trackKey] = {
          label: FormatName(trackKey),
          color: this.rootStore.trackStore.NextColor()
        };
      }
    }

    return this.trackInfo[trackKey];
  };

  AddOverlayTracks = flow(function * () {
    try {
      const metadata = this.rootStore.videoStore.metadata;
      if(!metadata.video_tags || !metadata.video_tags.overlay_tags) {
        return;
      }

      let overlayTagChunks = [];
      let overlayTagVersion = 0;
      const tagFiles = Object.keys(metadata.video_tags.overlay_tags);
      for(let i = 0; i < tagFiles.length; i++) {
        const {overlay_tags, version} = yield this.rootStore.client.LinkData({
          versionHash: this.rootStore.videoStore.versionHash,
          linkPath: `video_tags/overlay_tags/${tagFiles[i]}`,
          format: "json"
        });

        overlayTagVersion = version || 0;
        overlayTagChunks.push(overlay_tags.frame_level_tags);
      }

      if(overlayTagChunks.length === 0) {
        return;
      }

      const overlayTags = Object.assign({}, ...overlayTagChunks);
      overlayTags.version = overlayTagVersion;

      Object.keys(Object.values(overlayTags)[0]).forEach(trackKey => {
        this.enabledOverlayTracks[trackKey] = true;

        const metadataTrack = this.rootStore.trackStore.tracks.find(track => track.key === trackKey);

        if(metadataTrack) {
          metadataTrack.hasOverlay = true;
          this.trackMap[trackKey] = metadataTrack.trackId;
        }
      });

      // Overlay track is not observable for memory purposes
      this.overlayTrack = overlayTags;
      this.overlayEnabled = true;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load overlay tracks:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });

  ToggleOverlay = (enabled) => {
    this.overlayEnabled = enabled;
  };

  ToggleOverlayTrack = (trackKey, enabled) => {
    this.enabledOverlayTracks[trackKey] = enabled;
  };
}

export default OverlayStore;
