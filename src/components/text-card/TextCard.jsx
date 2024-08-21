import {CopyButton, Group, Paper, Text, Title, Tooltip} from "@mantine/core";
import {PaperClipIcon} from "@/assets/icons/index.js";
import styles from "@/pages/video-details/VideoDetails.module.css";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";

const TextCard = ({
  title,
  titleIcon,
  text,
  copyable=false,
  lineClamp=1,
  ...props
}) => {
  const textContent = copyable ? (
    <CopyButton value={text}>
      {({copied, copy}) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
          <SecondaryButton
            onClick={copy}
            size="xs"
            variant="transparent"
            iconOnly
          >
            <PaperClipIcon color="var(--mantine-color-elv-neutral-5)" className={styles.paperClipIcon} />
          </SecondaryButton>
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
