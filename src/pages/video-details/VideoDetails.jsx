import {observer} from "mobx-react-lite";
import Video from "@/components/video/Video.jsx";

const VideoDetails = observer(() => {
  return (
    <div>
      <Video />
    </div>
  );
});

export default VideoDetails;
