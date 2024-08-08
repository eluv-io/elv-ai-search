import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button, Flex,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title, Transition
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

import {
  ArrowLeftIcon,
  ShareIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  VideoEditorIcon
} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import VideoDetailsSidebar from "@/pages/video-details/sidebar/VideoDetailsSidebar.jsx";
import VideoDetailsTopToolbar from "@/pages/video-details/top-toolbar/VideoDetailsTopToolbar.jsx";
import {searchStore} from "@/stores/index.js";
import {FormatDuration, FormatTime} from "@/utils/helpers.js";

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

const TextCard = ({title, text, ...props}) => {
  return (
    <Paper bg="elv-gray.4" p="8 16" {...props}>
      <Title order={4} c="elv-gray.8" mb={8}>{ title }</Title>
      <Text size="sm" c="elv-gray.8" fw={400} lineClamp={1}>{ text }</Text>
    </Paper>
  );
};

const TimeInterval = ({startTime, endTime}) => {
  const startTimeFormatted = FormatTime({time: startTime});
  const endTimeFormatted = FormatTime({time: endTime});
  const duration = FormatDuration({startTime, endTime});

  return `${startTimeFormatted} - ${endTimeFormatted} (${duration})`;
};

const VideoDetails = observer(() => {
  const params = useParams();
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
        <Box pos="relative" pr={24} pl={24}>
          <Box w="100%" mb={22} pos="relative" >
            {
              !openedSidebar &&
              <Transition mounted={!openedSidebar} transition="fade" enterDelay={350} exitDuration={100}>
              {transitionStyle => (
                <ActionIcon
                  pos="absolute"
                  top={10}
                  right={10}
                  onClick={open}
                  {...buttonStyles}
                  style={{
                    opacity: openedSidebar ? 0 : 1,
                    zIndex: 10,
                    transitionStyle
                }}
                >
                  <ArrowLeftIcon {...iconStyles} />
                </ActionIcon>
              )}
            </Transition>
            }
            <AspectRatio ratio={16 / 9}>
              <Video
                objectId={params.id}
                playoutParameters={{
                  clipStart: clip.start_time / 1000,
                  clipEnd: clip.end_time / 1000,
                  ignoreTrimming: true
                }}
              />
            </AspectRatio>

          </Box>

          <Group mb={24} justify="space-between">
            <Title order={2} c="elv-gray.8" lineClamp={1} maw="50%">
              { clip.meta?.public?.asset_metadata?.title || clip.id }
            </Title>
            <Group style={{flexShrink: 0}}>
              <ActionIcon {...buttonStyles}>
                <ThumbUpIcon {...iconStyles} />
              </ActionIcon>
              <ActionIcon {...buttonStyles}>
                <ThumbDownIcon {...iconStyles} />
              </ActionIcon>
              <Button leftSection={<VideoEditorIcon {...iconStyles} />} {...buttonStyles}>
                <Text {...textStyles}>
                  Open in Video Editor
                </Text>
              </Button>
              <Button leftSection={<ShareIcon {...iconStyles} />} {...buttonStyles}>
                <Text {...textStyles}>
                  Share
                </Text>
              </Button>
            </Group>
          </Group>

          <TextCard title="Summary" text="lorem ipsum" mb={24} />

          <SimpleGrid cols={3}>
            <TextCard title="Content ID" text={params.id} />
            <TextCard
              title="Time Interval"
              text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
            />
            <TextCard title="Source URL" text={clip.url} />
          </SimpleGrid>
        </Box>

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
