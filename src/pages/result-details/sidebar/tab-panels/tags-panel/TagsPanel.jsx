import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Box, Accordion, AccordionControl, Text, Loader, Flex} from "@mantine/core";
import {CollapseIcon} from "@/assets/icons/index.js";
import TagsTable from "@/pages/result-details/sidebar/tab-panels/tags-panel/TagsTable.jsx";
import {searchStore} from "@/stores/index.js";

const AccordionItems = (({tagData={}}) => {
  if(Object.keys(tagData).length === 0) { return null; }

  const PanelContent = ({tags=[], id, field}) => {
    if(tags.length > 0) {
      return (
        <TagsTable
          tags={tags}
          field={field}
          tableId={id}
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
              <PanelContent tags={tagData[tagName].items} id={tagName} field={tagData[tagName].field} />
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

      await searchStore.GetTags({
        dedupe: false,
        assetType: searchStore.selectedSearchResult._assetType,
        prefix: searchStore.selectedSearchResult.prefix
      });

      setLoading(false);
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
