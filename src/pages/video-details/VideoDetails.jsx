import {observer} from "mobx-react-lite";
import {Box, Flex} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

import VideoDetailsMain from "@/pages/video-details/video-container/VideoDetailsMain.jsx";
import VideoDetailsSidebar from "@/pages/video-details/sidebar/VideoDetailsSidebar.jsx";
import VideoDetailsNavToolbar from "@/pages/video-details/nav-toolbar/VideoDetailsNavToolbar.jsx";
import {searchStore} from "@/stores/index.js";

export const sliderValues = [
  {value: 30000, label: "30:00"},
  {value: 60000, label: "01:00:00"},
  {value: 90000, label: "01:30:00"},
  {value: 120000, label: "02:00:00"},
  {value: 150000, label: "02:30:00"}
];

const VideoDetails = observer(() => {
  const clip = searchStore.selectedSearchResult;

  const [openedSidebar, {open, close}] = useDisclosure(true);

  if(!clip) { return null; }

  return (
    <Box p="8 0 24">
      <Flex direction="row" pl={"calc(110px - 28px - 2.125rem"} gap={28}>
        <VideoDetailsNavToolbar />

        {/* Left panel with video */}
        <Flex justify="center" pr={20} direction="row" gap={20} flex={1}>
          <VideoDetailsMain
            clip={clip}
            open={open}
            openedSidebar={openedSidebar}
          />

          {/* Right panel */}
          <VideoDetailsSidebar
            opened={openedSidebar}
            open={open}
            close={close}
          />
        </Flex>
      </Flex>
    </Box>
  );
});

export default VideoDetails;
