import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  CopyButton,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
  Tooltip,
  Transition
} from "@mantine/core";
import {
  ArrowLeftIcon,
  PaperClipIcon,
  ShareIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  VideoEditorIcon
} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import styles from "@/pages/video-details/VideoDetails.module.css";
import {FormatDuration, FormatTime} from "@/utils/helpers.js";

const TimeInterval = ({startTime, endTime}) => {
  const startTimeFormatted = FormatTime({time: startTime});
  const endTimeFormatted = FormatTime({time: endTime});
  const duration = FormatDuration({startTime, endTime});

  return `${startTimeFormatted} - ${endTimeFormatted} (${duration})`;
};

const TextCard = ({
  title,
  text,
  copyable=false,
  iconStyles,
  ...props
}) => {
  const textContent = copyable ? (
    <CopyButton value={text}>
      {({copied, copy}) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
          <ActionIcon onClick={copy} size="xs" variant="transparent">
            <PaperClipIcon {...iconStyles} className={styles.paperClipIcon} />
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  ) : null;

  return (
    <Paper bg="elv-gray.4" p="8 16" {...props}>
      <Group align="center" mb={8} gap={8}>
        <Title order={4} c="elv-gray.8">{ title }</Title>
        { textContent }
      </Group>
      <Text size="sm" c="elv-gray.8" fw={400} lineClamp={1}>{ text }</Text>
    </Paper>
  );
};

const VideoDetailsContainer = observer(({
  clip,
  openedSidebar,
  open,
  buttonStyles,
  textStyles,
  iconStyles
}) => {
  return (
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
            objectId={clip.id}
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
        <TextCard
          title="Content ID"
          text={clip.id}
          copyable
          iconStyles={iconStyles}
        />
        <TextCard
          title="Time Interval"
          text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
        />
        <TextCard
          title="Source URL"
          text={clip.url}
          copyable
          iconStyles={iconStyles}
        />
      </SimpleGrid>
    </Box>
  );
});

export default VideoDetailsContainer;
