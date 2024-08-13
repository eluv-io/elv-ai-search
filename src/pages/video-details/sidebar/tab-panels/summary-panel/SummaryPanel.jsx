import {observer} from "mobx-react-lite";
import {Box} from "@mantine/core";
import VideoDetailsSlider from "@/components/video-details-slider/VideoDetailsSlider.jsx";
import {sliderValues} from "@/pages/video-details/VideoDetails.jsx";

const SummaryPanel = observer(() => {
  return (
    <Box>
      <VideoDetailsSlider sliderValues={sliderValues} />
    </Box>
  );
});

export default SummaryPanel;
