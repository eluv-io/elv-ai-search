import {observer} from "mobx-react-lite";
import {Box, Flex, Loader, Stack, Text} from "@mantine/core";
import {searchStore, tagStore} from "@/stores/index.js";
import {PencilIcon} from "@/assets/icons/index.js";
import {FormatTime} from "@/utils/helpers.js";
import {useEffect, useState} from "react";

const Card = ({startTime, text}) => {
  return (
    <Flex mb={20} direction="column">
      <Box bg="elv-gray.4" w="100%" p={8} mb={12}>
        <Flex direction="row" justify="space-between" align="center">
          <Stack gap={0}>
            <Text fz="xs" fw={400} c="elv-gray.8">
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

const DescriptionPanel = observer(() => {
  const clip = searchStore.selectedSearchResult;
  const llavaTagKey = Object.keys(clip?._tags || {}).find(tagKey => tagKey.toLowerCase().includes("llava"));
  const llavaTags = clip._tags?.[llavaTagKey]?.items;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);

        await tagStore.GetTags({
          dedupe: false,
          assetType: searchStore.selectedSearchResult._assetType,
          prefix: searchStore.selectedSearchResult.prefix,
          objectId: searchStore.selectedSearchResult.id,
          startTime: searchStore.selectedSearchResult.start_time,
          endTime: searchStore.selectedSearchResult.end_time
        });
      } finally {
        setLoading(false);
      }
    };

    if(!searchStore.selectedSearchResult?._tags) {
      LoadData();
    }
  }, [searchStore.selectedSearchResult?._tags, searchStore.selectedSearchResult._assetType]);

  if(loading) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <Box>
      {
        llavaTags ?
        (llavaTags || []).map((item, i) => (
          <Card
            key={`llava-tag-${item.start_time}-${i}`}
            startTime={item.start_time}
            text={item.text}
          />
        )) : ""
      }
    </Box>
  );
});

export default DescriptionPanel;
