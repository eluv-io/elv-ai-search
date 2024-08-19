import {observer} from "mobx-react-lite";
import {Box, Flex} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

import VideoDetailsContainer from "@/pages/video-details/video-container/VideoDetailsMain.jsx";
import VideoDetailsSidebar from "@/pages/video-details/sidebar/VideoDetailsSidebar.jsx";
import VideoDetailsTopToolbar from "@/pages/video-details/top-toolbar/VideoDetailsTopToolbar.jsx";
import {searchStore} from "@/stores/index.js";

const iconStyles = {
  color: "var(--mantine-color-elv-neutral-5)"
};

const buttonStyles = {
  radius: 30,
  color: "elv-gray.1"
};

const textStyles = {
  c: "elv-neutral.5",
  fw: 600,
  size: "sm"
};

export const sliderValues = [
  {value: 30000, label: "30:00"},
  {value: 60000, label: "01:30:00"},
  {value: 150000, label: "02:30:00"}
];

const VideoDetails = observer(() => {
  const clip = searchStore.selectedSearchResult;

  const [openedSidebar, {open, close}] = useDisclosure(true);

  if(!clip) { return null; }

  return (
    <Box p="24 0">
      <VideoDetailsTopToolbar
        buttonStyles={buttonStyles}
        iconStyles={iconStyles}
        textStyles={textStyles}
      />

      {/* Left panel with video */}
      <Flex direction="row" justify="space-between">
        <VideoDetailsContainer
          clip={clip}
          buttonStyles={buttonStyles}
          textStyles={textStyles}
          iconStyles={iconStyles}
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
    </Box>
  );
});

export default VideoDetails;
