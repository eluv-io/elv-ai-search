import {flow, makeAutoObservable} from "mobx";
import FrameAccurateVideo from "@/utils/FrameAccurateVideo.js";

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
      this.Seek(this.segmentEnd - 1);

      this.EndSegment();
    }
  };

  SetVideo = flow(function * ({video, player, dropFrame, objectId, startTime, endTime}) {
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

    this.videoHandler = new FrameAccurateVideo({
      video,
      frameRate: this.frameRate,
      frameRateRat: this.frameRateRat,
      dropFrame,
      callback: this.UpdateVideo
    });

    const start = this.videoHandler.TimeToSMPTE(startTime);
    const end = this.videoHandler.TimeToSMPTE(endTime);

    // video.load();
  });

  GetClipTagData = flow(function * ({objectId, versionHash, startTime, endTime}) {
    const metadata = yield this.client.ContentObjectMetadata({
      objectId,
      versionHash,
      select: [
        "video_tags"
      ],
      resolveLinks: true,
      resolveIgnoreErrors: true,
      resolveIncludeSource: true
    });

    const tagData = yield this.client.utils.LimitedMap(
      5,
      Object.keys(metadata.video_tags?.metadata_tags),
      async fileLink => await this.client.LinkData({
        versionHash: versionHash,
        linkPath: `video_tags/metadata_tags/${fileLink}`,
        format: "json"
      })
    );

    Object.keys(tagData[0].metadata_tags || {}).forEach(tagKey => {
      tagData[0].metadata_tags[tagKey].tags = (tagData[0].metadata_tags[tagKey].tags || []).filter(tag => tag.start_time >= startTime && tag.end_time <= endTime);
    });

    return tagData;
  });

  PlaySegment = ({startTime, endTime}) => {
    const startFrame = this.videoHandler.TimeToFrame(startTime);
    const endFrame = this.videoHandler.TimeToFrame(endTime);
    this.Seek({frame: startFrame});
    this.segmentEnd = endFrame;
    // TODO: Get Seek working
    this.player.controls.Seek({time: (startTime - 21188) / 1000});
  };

  EndSegment() {
    this.segmentEnd = undefined;
  }

  Seek = ({frame, clearSegment=true}) => {
    if(clearSegment) { this.EndSegment(); }
    this.videoHandler.Seek(frame);
  };

  TimeToSMPTE = ({time}) => {
    return this.videoHandler.TimeToSMPTE({time});
  };
}

export default VideoStore;
