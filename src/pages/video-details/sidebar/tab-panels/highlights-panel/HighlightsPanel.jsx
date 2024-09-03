import {observer} from "mobx-react-lite";
import {Box, Flex, Group, Loader, Pill, Text} from "@mantine/core";
import {useEffect, useState} from "react";
import {highlightsStore, searchStore, summaryStore} from "@/stores/index.js";
import ThumbnailCard from "@/components/thumbnail-card/ThumbnailCard.jsx";
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

const HighlightsPanel = observer(() => {
  const [loading, setLoading] = useState(false);
  const clip = searchStore.selectedSearchResult;

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);

        if(!clip._aiLoadedHighlights) {
          await highlightsStore.GetHighlightsResults({
            objectId: clip.id,
            startTime: clip.start_time,
            endTime: clip.end_time
          });
        }

        if(!clip._aiLoadedSummary) {
          await summaryStore.GetSummaryResults({
            objectId: clip.id,
            startTime: clip.start_time,
            endTime: clip.end_time
          });
        }
      } finally {
        setLoading(false);
      }
    };

    LoadData();
  }, []);

  if(loading) {
    return (
      <Box align="center" mt={8}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box>
      {/* Highlights */}
      <Box mb={16}>
        {
          (clip._aiHighlights || []).map((item, i) => (
            <ThumbnailCard
              key={`thumbnail-${item.path || i}`}
              path={item._imageSrc}
              title={item.caption}
              startTime={item.start_time}
              endTime={item.end_time}
            />
          ))
        }
      </Box>

      {/* Hashtags */}
      <TitleGroup title={loading ? "Suggested Hashtags in Progress" : "Suggested Hashtags"} />
      {
        clip._aiHashtags ?
          <Flex wrap="wrap" direction="row" gap={8}>
            {
              (clip._aiHashtags || []).map(hashtag => (
                <Pill key={hashtag}>{ hashtag }</Pill>
              ))
            }
          </Flex> : "No results"
      }
    </Box>
  );
});

export default HighlightsPanel;
