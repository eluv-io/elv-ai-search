import {ActionIcon, Button, Group, Text, Title} from "@mantine/core";
import {ShareIcon, ThumbDownIcon, ThumbUpIcon, VideoEditorIcon} from "@/assets/icons/index.js";

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

const VideoActionsBar = ({title, subtitle, openModal}) => {
  return (
    <Group mb={24} justify="space-between">
      {
        title ?
          <Title order={2} c="elv-gray.8" lineClamp={1} maw="50%" style={{wordBreak: "break-all"}}>
            { title }
          </Title> : null
      }
      {
        subtitle ?
          <Text fz="xs">{ subtitle }</Text> : null
      }
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
        <Button leftSection={<ShareIcon {...iconStyles} />} {...buttonStyles} onClick={openModal}>
          <Text {...textStyles}>
            Share
          </Text>
        </Button>
      </Group>
    </Group>
  );
};

export default VideoActionsBar;
