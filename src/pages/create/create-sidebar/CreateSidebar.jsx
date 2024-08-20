import {AspectRatio, Box, CloseButton, Flex, Group, Image, Pill, Stack, Text, Transition} from "@mantine/core";
import {SparklesIcon} from "@/assets/icons/index.js";
import MockHighlights from "@/assets/mock/MockHighlights.js";
import {TimeInterval} from "@/utils/helpers.js";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

// TODO: Replace all mock data with real data
const mock_hashtags = ["#EpicRugby", "#ChampsionsClash", "#RugbyFans", "#RugbyShowdown", "#RugbyVibes", "#RugbyWin", "#RugbyHype", "#RugbyLive", "#ScrumBattle"];

const TitleGroup = ({title}) => {
  return (
    <Group gap={4} mb={13}>
      <AiIcon />
      <Text size="sm" fw={600} c="elv-gray.8">{ title }</Text>
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

const CreateSidebar = (({opened, close}) => {
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

            <TitleGroup title="AI Suggested Highlights" />
            {
              MockHighlights.results.map(item => (
                <ThumbnailCard
                  key={`thumbnail-${item.path}`}
                  path={item.image_src}
                  title={item.title}
                  startTime={item.start_time}
                  endTime={item.end_time}
                />
              ))
            }

            <TitleGroup title="Suggested Hashtags" />

            <Flex wrap="wrap" direction="row" gap={8}>
              {
                mock_hashtags.map(hashtag => (
                  <Pill key={hashtag}>{ hashtag }</Pill>
                ))
              }
            </Flex>
          </Box>
        )}
      </Transition>
    </>
  );
});

export default CreateSidebar;
