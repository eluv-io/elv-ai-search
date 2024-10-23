import {observer} from "mobx-react-lite";
import {Box, Flex, Loader, SimpleGrid, Text} from "@mantine/core";
import {searchStore} from "@/stores/index.js";
import TagsTable from "@/pages/video-details/sidebar/tab-panels/tags-panel/TagsTable.jsx";
import {useEffect, useState} from "react";

const MusicPanel = observer(() => {
  const [loading, setLoading] = useState(false);
  const tags = searchStore.selectedSearchResult?._tags?.["f_music_tag"];
  const [histogramResults, setHistogramResults] = useState([]);

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        const response = await searchStore.GetSearchResults({
          objectId: searchStore.currentSearch.index,
          fuzzySearchValue: "",
          musicType: "histogram",
          cacheResults: false
        });

        const histogramResponse = response?.stats?.["f_music_as_string"]?.histogram;
        let parsedResults = [];

        if(histogramResponse) {
          Object.keys(histogramResponse || {}).forEach(item => {
            const infoArray = item.split(":");
            const artist = infoArray[0];
            const song = infoArray[1];
            const value = histogramResponse[item];

            parsedResults.push({artist, song, value});
          });
        }

        setHistogramResults(parsedResults);
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
      {
        tags &&
        <TagsTable
          tags={tags}
        />
      }
      <Text fz="md" c="elv-gray.8" fw={600}>Explore</Text>
      <SimpleGrid cols={2}>
        {
          (histogramResults || []).map((item, i) => (
            <Flex
              key={`histogram-${item.artist}-${item.song}-${i}`}
              direction="column"
            >
              <Text c="elv-gray.8" fz="xs" fw={700}>
                { item.artist }
              </Text>
              <Text c="elv-gray.8" fz="xs" fw={400}>
                { item.song }
              </Text>
            </Flex>
          ))
        }
      </SimpleGrid>
    </Box>
  );
});

export default MusicPanel;
