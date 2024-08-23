import {CopyButton, Group, Loader, Paper, Text, Title, Tooltip} from "@mantine/core";
import {PaperClipIcon} from "@/assets/icons/index.js";
import styles from "@/pages/video-details/VideoDetails.module.css";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";

const TitleContent = ({
  titleIcon,
  title,
  id,
  loading,
  copyable,
  text
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
    <Group align="center" mb={8} gap={8}>
      { titleIcon ? titleIcon : null }
      <Title order={4} c="elv-gray.8">
        {
          loading ?
          (
            <Group>
              { `${id} in Progress` }
              <Loader size="xs" />
            </Group>
          ) :
          title
        }
      </Title>
      { !loading && textContent }
    </Group>
  );
};

const TextCard = ({
  title,
  titleIcon,
  text,
  id,
  copyable=false,
  lineClamp=1,
  loading,
  ...props
}) => {

  return (
    <Paper bg="elv-gray.4" p="8 16" {...props}>
      <TitleContent
        title={title}
        titleIcon={titleIcon}
        loading={loading}
        id={id}
        copyable={copyable}
        text={text}
      />
      {
        loading ? null :
        <Text size="sm" c="elv-gray.8" fw={400} lineClamp={lineClamp}>{ text || "" }</Text>
      }
    </Paper>
  );
};

export default TextCard;
