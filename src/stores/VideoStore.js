import {flow, makeAutoObservable} from "mobx";
import FrameAccurateVideo from "@/utils/FrameAccurateVideo.js";
import {searchStore} from "@/stores/index.js";

// Store for handling video state
class VideoStore {
  rootStore;
  videoHandler;
  player;
  smpte;
  seek;
  duration;
  currentTime;
  frame;
  frameRate;
  frameRateRat;
  segmentEnd;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  UpdateVideo = ({frame, smpte, progress}) => {
    if(!this.video) { return; }

    this.frame = Math.floor(frame);
    this.smpte = smpte;
    this.seek = progress * 100;
    this.duration = this.video.duration;
    this.currentTime = this.video.currentTime;

    // Ensure min isn't less than seek - may happen if the video isn't buffered
    if(this.seek < this.scaleMin) {
      this.scaleMin = this.seek;
    }

    if(this.playing && this.seek > this.scaleMax) {
      // If playing has gone beyond the max scale, push the whole scale slider forward by 50%
      const currentRange = this.scaleMax - this.scaleMin;
      this.scaleMax = Math.min(100, this.scaleMax + currentRange/2);
      this.scaleMin = this.scaleMax - currentRange;
    }

    // Segment play specified - stop when segment ends
    if(this.segmentEnd && this.frame >= this.segmentEnd - 3) {
      this.video.pause();
      this.Seek({frame: this.segmentEnd - 1});

      this.EndSegment();
    }
  };

  SetVideo = flow(function * ({
    video,
    player,
    dropFrame,
    objectId,
    // startTime,
    // endTime
  }) {
    this.video = video;
    this.player = player;

    const metadata = yield this.client.ContentObjectMetadata({
      objectId,
      libraryId: yield this.client.ContentObjectLibraryId({objectId}),
      select: [
        "offerings"
      ],
      resolveLinks: true,
      resolveIgnoreErrors: true,
      resolveIncludeSource: true
    });

    this.frameRateRat = metadata.offerings?.default?.media_struct?.streams?.video?.rate;
    this.frameRate = FrameAccurateVideo.ParseRat(this.frameRateRat);

    const videoHandler = new FrameAccurateVideo({
      video,
      frameRate: this.frameRate,
      frameRateRat: this.frameRateRat,
      dropFrame,
      callback: this.UpdateVideo
    });

    this.videoHandler = videoHandler;
  });

  PlaySegment = ({startTime, endTime}) => {
    const clipStartTime = searchStore.selectedSearchResult?.start_time || 0;
    // const startFrame = this.videoHandler.TimeToFrame((startTime - clipStartTime) / 1000);
    const endFrame = this.videoHandler.TimeToFrame(endTime);
    // this.Seek({frame: startFrame});
    this.Seek({time: (startTime - clipStartTime) / 1000});
    this.segmentEnd = endFrame;
    if(!this.player.controls.IsPlaying()) {
      this.player.controls.Play();
    }
  };

  EndSegment() {
    this.segmentEnd = undefined;
  }

  Seek = ({time, clearSegment=true}) => {
    if(clearSegment) { this.EndSegment(); }
    // this.videoHandler.Seek(frame);
    this.player.controls.Seek({time});
  };

  TimeToSMPTE = ({time}) => {
    if(!this.videoHandler) { return; }

    return this.videoHandler.TimeToSMPTE(time);
  };
}

export default VideoStore;
