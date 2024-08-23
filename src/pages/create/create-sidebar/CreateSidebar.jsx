import {AspectRatio, Box, CloseButton, Flex, Group, Image, Loader, Pill, Stack, Text, Transition} from "@mantine/core";
import MockHighlights from "@/assets/mock/MockHighlights.js";
import {TimeInterval} from "@/utils/helpers.js";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

const TitleGroup = ({title, loading}) => {
  return (
    <Group gap={4} mb={13}>
      <AiIcon />
      <Group>
        <Text size="sm" fw={600} c="elv-gray.8">{ title }</Text>
        {
          loading &&
          <Loader size="xs" />
        }
      </Group>
    </Group>
  );
};

const ThumbnailCard = ({path, title, startTime, endTime}) => {
  return (
    <Group gap={8} mb={8} wrap="nowrap">
      <Box flex="0 0 125px">
        <AspectRatio ratio={16 / 9}>
          <Image src={path} key={`thumbnail-${path}`} />
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

const CreateSidebar = (({
  opened,
  close,
  summaryResults,
  loading
}) => {
  if(!summaryResults && !loading) { return null; }

  return (
    <>
      <Transition
        mounted={opened}
        transition={"slide-left"}
        duration={250}
        timingFunction="ease"
      >
        {transitionStyle => (
          <Box
            flex="0 0 385px"
            pos="relative"
            opacity={opened ? 1 : 0}
            mr={24}
            pl={10}
            mt={43}
            style={{
              ...transitionStyle,
              zIndex: 10
            }}
          >
            <Group pos="absolute" right={-5} top={-5}>
              <CloseButton onClick={close} style={{zIndex: 50}} />
            </Group>

            <TitleGroup title={loading ? "AI Suggested Highlights in Progress" : "AI Suggested Highlights"} />
            {
              loading ? (
                <Flex justify="center" mb={8}>
                  <Loader size="sm" />
                </Flex>
              ) :
              MockHighlights.results.map((item, i) => (
                <ThumbnailCard
                  key={`thumbnail-${item.path || i}`}
                  path={item.image_src}
                  title={item.title}
                  startTime={item.start_time}
                  endTime={item.end_time}
                />
              ))
            }

            <TitleGroup title={loading ? "Suggested Hashtags in Progress" : "Suggested Hashtags"} />
            {
              loading ? (
                <Flex justify="center">
                  <Loader size="sm" />
                </Flex>
                ) :
                (
                  summaryResults?.hashtags ?
                  <Flex wrap="wrap" direction="row" gap={8}>
                    {
                      (summaryResults?.hashtags || []).map(hashtag => (
                        <Pill key={hashtag}>{ hashtag }</Pill>
                      ))
                    }
                  </Flex> : "No results"
                )
            }
          </Box>
        )}
      </Transition>
    </>
  );
});

export default CreateSidebar;
