import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {ActionIcon, AspectRatio, Box, Button, Flex, Group, Text} from "@mantine/core";
import Video from "@/components/video/Video.jsx";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import VideoDetailsRightPanel from "@/pages/video-details/right-panel/VideoDetailsRightPanel.jsx";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";

const iconStyles = {
  color: "var(--mantine-color-elv-neutral-5)"
};

const buttonStyles = {
  radius: 30,
  color: "elv-gray.4"
};

const VideoDetails = observer(() => {
  const params = useParams();

  return (
    <PageContainer>
      <Group mb={24}>
        <ActionIcon
          size="lg"
          {...buttonStyles}
        >
          <ArrowLeftIcon {...iconStyles} />
        </ActionIcon>
        <Button
          {...buttonStyles}
          leftSection={<ArrowLeftIcon {...iconStyles} />}
        >
          <Text c="elv-neutral.5" fw={600} size="sm">Previous</Text>
        </Button>
        <Button
          {...buttonStyles}
          leftSection={<ArrowRightIcon {...iconStyles} />}
        >
          <Text c="elv-neutral.5" fw={600} size="sm">Next</Text>
          </Button>
      </Group>

      <Flex direction="row" justify="space-between" gap={35}>
        <Box w="calc(100% - 135px)">
          <Box w="100%">
            <AspectRatio ratio={16 / 9}>
              <Video objectId={params.id} />
            </AspectRatio>
          </Box>
        </Box>

        <VideoDetailsRightPanel />
      </Flex>
    </PageContainer>
  );
});

export default VideoDetails;
