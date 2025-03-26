import Fraction from "fraction.js";

export const FrameRateNumerator = {
  NTSC: 30000,
  NTSCFilm: 24000,
  NTSCHD: 60000,
  PAL: 25,
  PALHD: 50,
  Film: 24,
  Web: 30,
  High: 60
};

export const FrameRateDenominator = {
  NTSC: 1001,
  NTSCFilm: 1001,
  NTSCHD: 1001,
  PAL: 1,
  PALHD: 1,
  Film: 1,
  Web: 1,
  High: 1
};

export const FrameRates = {
  NTSC: new Fraction(FrameRateNumerator["NTSC"]).div(FrameRateDenominator["NTSC"]),
  NTSCFilm: new Fraction(FrameRateNumerator["NTSCFilm"]).div(FrameRateDenominator["NTSC"]),
  NTSCHD: new Fraction(FrameRateNumerator["NTSCHD"]).div(FrameRateDenominator["NTSCHD"]),
  PAL: new Fraction(25),
  PALHD: new Fraction(50),
  Film: new Fraction(24),
  Web: new Fraction(30),
  High: new Fraction(60)
};

class FrameAccurateVideo {
  constructor({
    video,
    frameRate,
    frameRateRat,
    dropFrame=false,
    callback
  }) {
    this.video = video;
    this.SetFrameRate({rate: frameRate, rateRat: frameRateRat});
    this.callback = callback;

    // Only set drop frame if appropriate based on frame rate
    const frameRateKey = FrameAccurateVideo.FractionToRateKey(`${this.frameRateNumerator}/${this.frameRateDenominator}`);
    this.dropFrame = dropFrame && ["NTSC", "NTSCFilm", "NTSCHD"].includes(frameRateKey);

    if(callback) {
      this.RegisterCallback();
    }

    this.Update = this.Update.bind(this);
  }

  static FractionToRateKey(input) {
    let rate = input;
    if(typeof input === "string") {
      if(input.includes("/")) {
        rate = input.split("/");
        rate = rate[0] / rate[1];
      } else {
        rate = parseFloat(input);
      }
    }

    switch(rate) {
      case 24:
        return "Film";
      case 25:
        return "PAL";
      case 30:
        return "Web";
      case 50:
        return "PALHD";
      case 60:
        return "High";
      default:
        if(Math.abs(24 - rate) < 0.1) {
          return "NTSCFilm";
        } else if(Math.abs(30 - rate) < 0.1) {
          return "NTSC";
        } else if(Math.abs(60 - rate) < 0.1) {
          return "NTSCHD";
        }

        console.error(`Unknown playback rate: ${input}`);
    }
  }

  /* Conversion utility methods */

  static ParseRat(str) {
    if(str.includes("/")) {
      const num = parseInt(str.split("/")[0]);
      const denom = parseInt(str.split("/")[1]);

      return Number((num / denom).toFixed(3));
    } else {
      return parseInt(str);
    }
  }

  SetFrameRate({rate, rateRat}) {
    let num, denom;
    if(rateRat) {
      if(rateRat.includes("/")) {
        num = parseInt(rateRat.split("/")[0]);
        denom = parseInt(rateRat.split("/")[1]);
      } else {
        num = parseInt(rateRat);
        denom = 1;
      }

      rate = new Fraction(num).div(denom);
    } else {
      const rateKey = FrameAccurateVideo.FractionToRateKey(this.frameRate);
      num = FrameRateNumerator[rateKey];
      denom = FrameRateDenominator[rateKey];
    }

    this.frameRate = new Fraction(rate);
    this.frameRateNumerator = num;
    this.frameRateDenominator = denom;
  }

  FrameToRat(frame) {
    return `${frame * this.frameRateDenominator}/${this.frameRateNumerator}`;
  }

  FrameToTime(frame) {
    return new Fraction(frame).div(this.frameRate).valueOf();
  }

  FrameToSMPTE(frame) {
    return this.SMPTE(frame);
  }

  ProgressToTime(progress) {
    const duration = this.video.duration || 0;

    return new Fraction(progress).mul(duration).valueOf();
  }

  ProgressToSMPTE(progress) {
    const duration = this.video.duration || 0;

    return this.TimeToSMPTE(new Fraction(progress).mul(duration));
  }

  TimeToFrame(time, round=false) {
    const frame = new Fraction(time || 0).mul(this.frameRate);

    if(round) {
      return frame.round().valueOf();
    } else {
      return frame.floor().valueOf();
    }
  }

  TimeToSMPTE(time) {
    return this.SMPTE(this.TimeToFrame(time));
  }

  SMPTEToFrame(smpte) {
    const components = smpte.split(":").reverse();

    const frames = new Fraction(components[0]);
    const seconds = new Fraction(components[1]);
    const minutes = new Fraction(components[2]);
    const hours = new Fraction(components[3] || 0);

    let skippedFrames = 0;
    if(this.dropFrame) {
      const skippedFramesPerMinute = this.frameRate.equals(FrameRates.NTSCHD) ? new Fraction(4) : new Fraction(2);
      const totalMinutes = minutes.add(hours.mul(60));
      const tenMinutes = totalMinutes.div(10).floor();
      skippedFrames = totalMinutes.mul(skippedFramesPerMinute)
        .sub(tenMinutes.mul(skippedFramesPerMinute));
    }

    return frames
      .add(seconds.mul(this.frameRate.round()))
      .add(minutes.mul(this.frameRate.round()).mul(60))
      .add(hours.mul(this.frameRate.round()).mul(60).mul(60))
      .sub(skippedFrames)
      .valueOf();
  }

  SMPTEToTime(smpte) {
    const frame = this.SMPTEToFrame(smpte);

    return new Fraction(frame).div(this.frameRate).valueOf();
  }

  /* Time Calculations */

  Frame() {
    return this.TimeToFrame(this.video.currentTime);
  }

  Pad(fraction) {
    fraction = fraction.valueOf();
    return fraction < 10 ? `0${fraction}` : fraction;
  }

  SMPTE(f) {
    let frame = (typeof f !== "undefined" ? new Fraction(f) : new Fraction(this.Frame())).floor();
    const frameRate = this.frameRate.round();

    if(this.dropFrame) {
      const framesPerMinute = this.frameRate.equals(FrameRates.NTSCHD) ? new Fraction(4) : new Fraction(2);
      const tenMinutes = new Fraction("17982").mul(framesPerMinute).div(2);
      const oneMinute = new Fraction("1798").mul(framesPerMinute).div(2);

      const tenMinuteIntervals = frame.div(tenMinutes).floor();
      let framesSinceLastInterval = frame.mod(tenMinutes);

      // If framesSinceLastInterval < framesPerMinute
      if(framesSinceLastInterval.compare(framesPerMinute) < 0) {
        // This is where the jump from :59:29 -> :00:02 or :59:59 -> :00:04 happens
        framesSinceLastInterval = framesSinceLastInterval.add(framesPerMinute);
      }

      frame = frame.add(
        framesPerMinute.mul(tenMinuteIntervals).mul("9").add(
          framesPerMinute.mul((framesSinceLastInterval.sub(framesPerMinute)).div(oneMinute).floor())
        )
      );
    }

    const hours = frame.div(frameRate.mul(3600)).mod(24).floor();
    const minutes = frame.div(frameRate.mul(60)).mod(60).floor();
    const seconds = frame.div(frameRate).mod(60).floor();
    const frames = frame.mod(frameRate).floor();

    const lastColon = this.dropFrame ? ";" : ":";

    const hMSDisplay = [
      (hours).toString().padStart(2, "0"),
      (minutes).toString().padStart(2, "0"),
      (seconds).toString().padStart(2, "0")
    ];

    return `${hMSDisplay.join(":")}${lastColon}${(frames).toString().padStart(2, "0")}`;
  }

  Progress() {
    if(isNaN(this.video.duration)) { return new Fraction(0); }

    return new Fraction(this.video.currentTime).div(this.video.duration);
  }

  TotalFrames() {
    return Math.floor(new Fraction(this.video.duration || 0).mul(this.frameRate).valueOf());
  }

  /* Controls */

  SeekForward(frames=1) {
    const frame = this.Frame();
    this.Seek(frame.add(frames));
  }

  SeekBackward(frames=1) {
    const frame = new Fraction(this.Frame());
    this.Seek(frame.sub(frames));
  }

  SeekPercentage(percent) {
    this.Seek(new Fraction(this.TotalFrames()).mul(percent));
  }

  Seek(frame) {
    // Whenever seeking, stop comfortably in the middle of a frame
    frame = new Fraction(frame).floor().add(0.5);

    this.video.currentTime = frame.div(this.frameRate).valueOf().toFixed(3);
  }

  /* Callbacks */

  Update() {
    if(this.callback) {
      this.callback({
        frame: this.Frame().valueOf(),
        smpte: this.SMPTE(),
        progress: this.Progress().valueOf()
      });
    }
  }

  RegisterCallback() {
    this.Update();

    this.video.onseeked = (event) => this.Update(event);
    this.video.onseeking = (event) => this.Update(event);
    this.video.onplay = () => this.AddListener();
    this.video.onpause = () => {
      // On pause, seek to the nearest frame
      this.Seek(this.Frame() + (this.frameRate.valueOf() > 30 ? 2 : 1));
      this.RemoveListener();
    };

    this.video.onended = () => this.RemoveListener();
    this.video.onratechange = () => {
      // Update listener rate
      if(this.listener) {
        this.RemoveListener();
        this.AddListener();
      }
    };
  }

  RemoveCallback() {
    this.video.onseeked = undefined;
    this.video.onseeking = undefined;
    this.video.onplay = undefined;
    this.video.onpause = undefined;
    this.video.onended = undefined;
    this.video.onratechange = undefined;
  }

  AddListener() {
    // Call once per frame - possible range 10hz - 50hz               Prevent division by zero
    const fps = new Fraction(this.video.playbackRate).mul(this.frameRate).add(new Fraction("0.00001"));
    const interval = Math.min(Math.max(new Fraction(1000).div(fps).valueOf(), 20), 100);

    this.listener = setInterval(() => {
      if(this.video.paused || this.video.ended) {
        return;
      }

      this.Update();
    }, interval);
  }

  RemoveListener() {
    if(this.listener) {
      clearInterval(this.listener);
    }

    this.Update();
  }
}

export default FrameAccurateVideo;
