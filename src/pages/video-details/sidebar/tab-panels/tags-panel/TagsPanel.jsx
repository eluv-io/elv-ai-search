import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Box, Accordion, AccordionControl, Text, Loader, Flex} from "@mantine/core";
import {CollapseIcon} from "@/assets/icons/index.js";
import TagsTable from "@/pages/video-details/sidebar/tab-panels/tags-panel/TagsTable.jsx";
import {searchStore} from "@/stores/index.js";

const AccordionItems = (({tagData={}}) => {
  if(Object.keys(tagData).length === 0) { return null; }

  const PanelContent = ({tags=[]}) => {
    if(tags.length > 0) {
      return (
        <TagsTable
          tags={tags}
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
        Object.keys(tagData).map(tagName => (
          <Accordion.Item value={tagName} key={tagName}>
            <AccordionControl>
              { tagName }
            </AccordionControl>
            <Accordion.Panel>
              <PanelContent tags={tagData[tagName]} />
            </Accordion.Panel>
          </Accordion.Item>
        ))
      }
    </>
  );
});

const TagsPanel = observer(() => {
  const [value, setValue] = useState([]);
  const [loading, setLoading] = useState(false);

  const tags = Object.fromEntries(
    Object.entries(searchStore.selectedSearchResult?._tags || {})
    .filter(([key]) => !key.toLowerCase().includes("llava"))
  );

  useEffect(() => {
    const LoadData = async() => {
      setLoading(true);

      await searchStore.GetTags(false);

      setLoading(false);
    };

    if(!searchStore.selectedSearchResult?._tags) {
      LoadData();
    }
  }, [searchStore.selectedSearchResult?._tags]);

  if(loading) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <Box>
      <Accordion
        multiple
        value={value}
        onChange={setValue}
        chevron={<CollapseIcon />}
      >
        <AccordionItems tagData={tags} />
      </Accordion>
    </Box>
  );
});

export default TagsPanel;
