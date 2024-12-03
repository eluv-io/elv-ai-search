import {Group, Text, Title} from "@mantine/core";
import {ShareIcon, HollowStarIcon, FilledStarIcon, VideoEditorIcon} from "@/assets/icons/index.js";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import styles from "@/components/video-actions-bar/VideoActionsBar.module.css";

const VideoActionsBar = ({title, subtitle, openModal, onClick, currentStars}) => {
  let star1icon = HollowStarIcon;
  let star2icon = HollowStarIcon;
  let star3icon = HollowStarIcon;

  if (currentStars === "RELEVANCY_1_STAR") {
    star1icon = FilledStarIcon;
  } else if (currentStars === "RELEVANCY_2_STAR") {
    star1icon = star2icon = FilledStarIcon;
  } else if (currentStars === "RELEVANCY_3_STAR") {
    star1icon = star2icon = star3icon = FilledStarIcon;
  }

  return (
    <Group mb={8} wrap="nowrap">
      {
        title ?
          <Title order={2} c="elv-gray.8" lineClamp={1} maw="70%" style={{wordBreak: "break-all"}}>
            { title }
          </Title> : null
      }
      {
        subtitle ?
          <Text fz="xs">{ subtitle }</Text> : null
      }
      <Group style={{flexShrink: 0, marginLeft: "auto"}}>
        <Group gap="1" classNames={{root: styles.starBackground}}>
          <SecondaryButton size="lg" iconOnly Icon={star1icon} hoverText="Irrelevant" onClick={() => onClick("RELEVANCY_1_STAR")}/>
          <SecondaryButton size="lg" iconOnly Icon={star2icon} hoverText="Relevant" onClick={() => onClick("RELEVANCY_2_STAR")}/>
          <SecondaryButton size="lg" iconOnly Icon={star3icon} hoverText="Highly Relevant" onClick={() => onClick("RELEVANCY_3_STAR")}/>
        </Group>
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
