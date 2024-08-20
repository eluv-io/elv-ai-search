import {ActionIcon, CopyButton, Group, Paper, Text, Title, Tooltip} from "@mantine/core";
import {PaperClipIcon} from "@/assets/icons/index.js";
import styles from "@/pages/video-details/VideoDetails.module.css";

const TextCard = ({
  title,
  titleIcon,
  text,
  copyable=false,
  iconStyles,
  lineClamp=1,
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
        { titleIcon ? titleIcon : null }
        <Title order={4} c="elv-gray.8">{ title }</Title>
        { textContent }
      </Group>
      <Text size="sm" c="elv-gray.8" fw={400} lineClamp={lineClamp} style={{wordBreak: "break-all"}}>{ text }</Text>
    </Paper>
  );
};

export default TextCard;
