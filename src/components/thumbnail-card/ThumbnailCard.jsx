import {ActionIcon, AspectRatio, Box, Flex, Group, Image, Stack, Text} from "@mantine/core";
import {TimeInterval} from "@/utils/helpers.js";
import {useState} from "react";
import {videoStore} from "@/stores/index.js";
import {PlayIcon} from "@/assets/icons/index.js";

const ThumbnailCard = ({path, title, startTime, endTime, playable, lineClamp=2}) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Group gap={8} mb={8} wrap="nowrap">
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
        <Text
          fz="xs"
          lineClamp={lineClamp}
          style={{lineHeight: "1"}}
          fw={700}
        >
          { title }
        </Text>
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
          onClick={() => videoStore.PlaySegment({startTime, endTime})}
        >
          <PlayIcon width={18} height={18} color="var(--mantine-color-elv-neutral-5)" style={{verticalAlign: "middle"}} />
        </ActionIcon>
      }
    </Group>
  );
};

export default ThumbnailCard;
