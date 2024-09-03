import {observer} from "mobx-react-lite";
import {Box, Flex, Stack, Text} from "@mantine/core";
import {searchStore} from "@/stores/index.js";
import {PencilIcon} from "@/assets/icons/index.js";
import {FormatTime} from "@/utils/helpers.js";

const Card = ({startTime, text}) => {
  return (
    <Flex mb={20} direction="column">
      <Box bg="elv-gray.4" w="100%" p={8} mb={12}>
        <Flex direction="row" justify="space-between" align="center">
          <Stack gap={0}>
            <Text fz="xs" fw={400} c="elv-gray.3">
              Timestamp
            </Text>
            <Text fw={600} fz="md" c="elv-gray.8">
              { FormatTime({time: startTime}) }
            </Text>
          </Stack>
          <PencilIcon color="var(--mantine-color-elv-gray-3)" style={{marginRight: "4px"}} />
        </Flex>
      </Box>
      <Box>
        <Text c="elv-gray.8" fw={400} fz="md" lh="normal">
          { text }
        </Text>
      </Box>
    </Flex>
  );
};

const SummaryPanel = observer(() => {
  const clip = searchStore.selectedSearchResult;
  const llavaTags = clip?._tags?.f_llava_tag;

  return (
    <Box>
      {
        llavaTags ?
        llavaTags.map((item, i) => (
          <Card
            key={`llava-tag-${item.start_time}-${i}`}
            startTime={item.start_time}
            text={item.text}
          />
        )) : "No tags"
      }
    </Box>
  );
});

export default SummaryPanel;
