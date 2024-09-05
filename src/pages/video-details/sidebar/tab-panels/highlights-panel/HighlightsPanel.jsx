import {observer} from "mobx-react-lite";
import {Box, Button, Flex, Group, Loader, Pill, Text} from "@mantine/core";
import {useState} from "react";
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
  const [highlights, setHighlights] = useState(null);
  const [hashtags, setHashtags] = useState(null);
  const clip = searchStore.selectedSearchResult;

  const HandleGenerate = async(cache=true) => {
    try {
      setLoading(true);

      const highlightsRes = await highlightsStore.GetHighlightsResults({
        objectId: clip.id,
        startTime: clip.start_time,
        endTime: clip.end_time,
        cache
      });

      setHighlights(highlightsRes);

      const summaryResults = await summaryStore.GetSummaryResults({
        objectId: clip.id,
        startTime: clip.start_time,
        endTime: clip.end_time,
        cache
      });

      setHashtags(summaryResults.hashtags);
    } finally {
      setLoading(false);
    }
  };

  if(loading) {
    return (
      <Box align="center" mt={8}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box>
      {
        !highlights ?
          (
            <Box align="center" mt={8}>
              <Button onClick={HandleGenerate}>Generate Highlights</Button>
            </Box>
          ) :
          (
            <>
              {/* Highlights */}
              <Box mb={16}>
                {
                  (highlights || []).map((item, i) => (
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
                hashtags ?
                  <Flex wrap="wrap" direction="row" gap={8}>
                    {
                      (hashtags || []).map(hashtag => (
                        <Pill key={hashtag}>{ hashtag }</Pill>
                      ))
                    }
                  </Flex> : "No results"
              }
              <Flex mt={16} justify="center">
                <Button
                  onClick={async () => {
                    setHighlights(null);

                    await HandleGenerate(false);
                  }}
                  size="xs"
                >
                  Regenerate
                </Button>
              </Flex>
            </>
          )
      }
    </Box>
  );
});

export default HighlightsPanel;
