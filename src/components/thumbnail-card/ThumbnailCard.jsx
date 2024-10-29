import {ActionIcon, AspectRatio, Box, Flex, Group, Image, Stack, Text} from "@mantine/core";
import {TimeInterval} from "@/utils/helpers.js";
import {useState} from "react";
import {videoStore} from "@/stores/index.js";
import {DownArrowIcon, PlayIcon} from "@/assets/icons/index.js";

const ThumbnailCard = ({path, title, startTime, endTime, playable, lineClamp=2}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <Group gap={8} mb={8} wrap="nowrap" align="center">
      <Box flex="0 0 125px">
        <AspectRatio ratio={16 / 9}>
          {
            imageFailed ?
              (
                <Flex bg="elv-gray.8" align="center" justify="center" p={16}>
                </Flex>
              ) :
              (
                <Image
                  src={path}
                  key={`thumbnail-${path}`}
                  onError={() => setImageFailed(true)}
                />

              )
          }
        </AspectRatio>
      </Box>
      <Stack gap={2}>
        <Group gap={0} wrap="nowrap" align="center">
          <Text
            fz="xs"
            lineClamp={expanded ? undefined : lineClamp}
            style={{lineHeight: "1"}}
            fw={700}
          >
            { title }
          </Text>
          <ActionIcon variant="transparent" onClick={() => setExpanded(prevState => !prevState)}>
            <DownArrowIcon color="var(--mantine-color-elv-gray-5)" style={{rotate: expanded ? "180deg" : "0deg"}} />
          </ActionIcon>
        </Group>
        <Text fz="xs">
          { TimeInterval({startTime, endTime}) }
        </Text>
      </Stack>
      {
        playable &&
        <ActionIcon
          variant="transparent"
          aria-label="Play button"
          title="Play Segment"
          ml="auto"
          flex="0 0 20px"
          onClick={() => videoStore.PlaySegment({startTime, endTime})}
        >
          <PlayIcon width={18} height={18} color="var(--mantine-color-elv-neutral-5)" style={{verticalAlign: "middle"}} />
        </ActionIcon>
      }
    </Group>
  );
};

export default ThumbnailCard;
