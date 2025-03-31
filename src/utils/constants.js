import {ImageIcon, LayerIcon, VideoClipIcon, WaveIcon} from "@/assets/icons/index.js";

export const SLIDER_VALUES = [
  {value: 30000, label: "30:00"},
  {value: 60000, label: "01:00:00"},
  {value: 90000, label: "01:30:00"},
  {value: 120000, label: "02:00:00"},
  {value: 150000, label: "02:30:00"}
];

export const ORG_TAGS = {
  "mez": "elv:vod:mez",
  "master": "elv:vod:master",
  "live_stream": "elv:live_stream",
  "folder": "elv:folder",
  "index": "elv:index"
};

// TODO: repository and live_stream need Icons
export const MEDIA_TYPES = {
  "video": {label: "Video", Icon: VideoClipIcon, iconColor: "elv-red-4"},
  "audio": {label: "Audio", Icon: WaveIcon, iconColor: "elv-blue-violet-3"},
  "image": {label: "Image", Icon: ImageIcon, iconColor: "elv-green-6"},
  "repository": {label: "Repository", Icon: LayerIcon, iconColor: "elv-violet-2"},
  "live_stream": {label: "Live Stream", Icon: VideoClipIcon, iconColor: "elv-red-4"},
  "composition": {label: "Composition", Icon: LayerIcon, iconColor: "elv-violet-2"}
};
