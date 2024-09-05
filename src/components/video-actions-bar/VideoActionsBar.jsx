import {Group, Text, Title} from "@mantine/core";
import {ShareIcon, ThumbDownIcon, ThumbUpIcon, VideoEditorIcon} from "@/assets/icons/index.js";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";

const VideoActionsBar = ({title, subtitle, openModal, onClick, currentThumb}) => {
  // XXX
  let upColor = "var(--mantine-color-elv-neutral-5)";
  let downColor = "var(--mantine-color-elv-neutral-5)";
  if (currentThumb === "THUMBS_UP") {
    upColor = "var(--mantine-color-elv-violet-3)";
  } else if (currentThumb === "THUMBS_DOWN") {
    downColor = "var(--mantine-color-elv-violet-3)";
  }

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
        <SecondaryButton iconColor={upColor} iconOnly Icon={ThumbUpIcon} onClick={() => onClick("THUMBS_UP")} />
        <SecondaryButton iconColor={downColor} iconOnly Icon={ThumbDownIcon} onClick={() => onClick("THUMBS_DOWN")} />
        <SecondaryButton LeftIcon={VideoEditorIcon}>
          Open in Video Editor
        </SecondaryButton>
        <SecondaryButton LeftIcon={ShareIcon} onClick={openModal}>
          Share
        </SecondaryButton>
      </Group>
    </Group>
  );
};

export default VideoActionsBar;
