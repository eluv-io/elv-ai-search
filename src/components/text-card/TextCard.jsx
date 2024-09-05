import {Button, CopyButton, Flex, Group, Loader, Paper, Text, Title, Tooltip} from "@mantine/core";
import {LinkIcon} from "@/assets/icons/index.js";
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
              <LinkIcon color="var(--mantine-color-elv-neutral-5)" />
            </SecondaryButton>
          </Tooltip>
        )}
      </CopyButton>
    ) : null;

  return (
    <Group align="center" mb={8} gap={8}>
      { titleIcon ? titleIcon : null }
      <Title order={4} c="elv-gray.8" lh={1}>
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

const TextContent = ({
  text,
  loading,
  copyText,
  lineClamp,
  children
}) => {
  if(loading) { return <Loader size="xs" />; }

  if(text) {
    return (
      <Group wrap="nowrap" gap={8}>
        <Text size="sm" c="elv-gray.8" fw={400} lineClamp={lineClamp}>{ text || "" }</Text>
        {
          !!copyText &&
          <CopyButton value={copyText}>
            {({copied, copy}) => (
              <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
                <SecondaryButton
                  onClick={copy}
                  size="xs"
                  variant="transparent"
                  iconOnly
                >
                  <LinkIcon color="var(--mantine-color-elv-neutral-5)" />
                </SecondaryButton>
              </Tooltip>
            )}
          </CopyButton>
        }
      </Group>
    );
  } else {
    return children;
  }
};

const TextCard = ({
  title,
  titleIcon,
  text,
  id,
  copyable=false,
  copyText,
  lineClamp=1,
  loading,
  topActions=[],
  children,
  ...props
}) => {

  return (
    <Paper bg="elv-gray.4" p="16 12" {...props}>
      {
        title &&
        <Flex justify="space-between" mb={8}>
          <TitleContent
            title={title}
            titleIcon={titleIcon}
            loading={loading}
            id={id}
            copyable={copyable}
            text={text}
          />
          {
            topActions.map(action => (
              <Button key={action.text} onClick={action.onClick} size="xs">
                { action.text }
              </Button>
            ))
          }
        </Flex>
      }
      <TextContent
        loading={loading}
        text={text}
        copyText={copyText}
        lineClamp={lineClamp}
      >
        { children }
      </TextContent>
    </Paper>
  );
};

export default TextCard;
