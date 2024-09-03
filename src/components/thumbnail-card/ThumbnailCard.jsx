import {AspectRatio, Box, Flex, Group, Image, Stack, Text} from "@mantine/core";
import {TimeInterval} from "@/utils/helpers.js";
import {useState} from "react";

const ThumbnailCard = ({path, title, startTime, endTime}) => {
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
          lineClamp={2}
          style={{lineHeight: "1"}}
          fw={700}
        >
          { title }
        </Text>
        <Text fz="xs">
          { TimeInterval({startTime, endTime}) }
        </Text>
      </Stack>
    </Group>
  );
};

export default ThumbnailCard;
