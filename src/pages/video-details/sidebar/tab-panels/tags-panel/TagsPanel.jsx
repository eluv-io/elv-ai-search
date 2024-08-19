import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Box, Accordion, AccordionControl, Text, Loader, Flex, ActionIcon} from "@mantine/core";
import {CollapseIcon, PlayIcon} from "@/assets/icons/index.js";
import TagsTable from "@/pages/video-details/sidebar/tab-panels/tags-panel/TagsTable.jsx";
import VideoDetailsSlider from "@/components/video-details-slider/VideoDetailsSlider.jsx";
import {sliderValues} from "@/pages/video-details/VideoDetails.jsx";
import {searchStore, videoStore} from "@/stores/index.js";
import {FormatTime} from "@/utils/helpers.js";

const AccordionItems = (({tagData={}}) => {
  if(Object.keys(tagData).length === 0) { return null; }

  const tableHeaders = ["Timestamps", "Tags"];

  const PanelContent = ({tags=[]}) => {
    if(tags.length > 0) {
      return (
        <TagsTable
          headers={tableHeaders}
          rows={tags.map((tagItem, i) => (
            {
              timestamp: FormatTime({time: tagItem.start_time}),
              tags: tagItem.text.length > 0 ? tagItem.text.join(", ") : "",
              id: `tag-${tagItem.id || i}-${tagItem.start_time}-${tagItem.end_time}`,
              action: {
                icon: (
                  <ActionIcon
                    variant="transparent"
                    aria-label="Play button"
                    title="Play Segment"
                    onClick={() => videoStore.PlaySegment({startTime: tagItem.start_time, endTime: tagItem.end_time})}
                  >
                    <PlayIcon width={18} height={18} color="var(--mantine-color-elv-neutral-5)" style={{verticalAlign: "middle"}} />
                  </ActionIcon>
                )
              }
            }
          ))}
        />
      );
    } else {
      return (
        <Box mt={8} mb={8}>
          <Text size="xs">No tags</Text>
        </Box>
      );
    }
  };

  return (
    <>
      {
        Object.keys(tagData).map(value => (
          <Accordion.Item value={value} key={value}>
            <AccordionControl>{ tagData[value].label }</AccordionControl>
            <Accordion.Panel>
              <PanelContent tags={tagData[value].tags} />
            </Accordion.Panel>
          </Accordion.Item>
        ))
      }
    </>
  );
});

const TagsPanel = observer(() => {
  const [value, setValue] = useState(["stt", "object"]);
  const [tagData, setTagData] = useState();
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      setLoadingTags(true);
      try {
        const tagResponse = await videoStore.GetClipTagData({
          versionHash: searchStore.selectedSearchResult?.hash,
          startTime: searchStore.selectedSearchResult?.start_time,
          endTime: searchStore.selectedSearchResult?.end_time
        });

        setTagData(tagResponse?.[0]?.metadata_tags);
      } finally {
        setLoadingTags(false);
      }
    };

    LoadData();
  }, []);

  return (
    <Box>
      <VideoDetailsSlider sliderValues={sliderValues} />

      {
        loadingTags ?
          (
            <Flex align="center" justify="center">
              <Loader />
            </Flex>
          ) :
          (
            <Accordion
              multiple
              value={value}
              onChange={setValue}
              chevron={<CollapseIcon />}
            >
              <AccordionItems tagData={tagData} />
            </Accordion>
          )
      }
    </Box>
  );
});

export default TagsPanel;
