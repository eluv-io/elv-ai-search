import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Group, SegmentedControl, Select, Tabs, Text, VisuallyHidden} from "@mantine/core";
import tabStyles from "./SearchTabs.module.css";
import ClipsPanel from "@/pages/search/tab-panels/ClipsPanel.jsx";
import FullVideosPanel from "@/pages/search/tab-panels/FullVideosPanel.jsx";
import ImagesPanel from "@/pages/search/tab-panels/ImagesPanel.jsx";
import ReelsPanel from "@/pages/search/tab-panels/ReelsPanel.jsx";
import SearchBar from "@/components/search-bar/SearchBar.jsx";
import {useState} from "react";
import {searchStore} from "@/stores/index.js";
import {Pluralize} from "@/utils/helpers.js";
import {GridIcon, ListIcon} from "@/assets/icons/index.js";
import Badge from "@/components/badge/Badge.jsx";
import styles from "./Search.module.css";

const SEARCH_TABS = [
  {value: "full-length-vid", label: "Full Length Videos", Component: FullVideosPanel},
  {value: "clips", label: "Clips", Component: ClipsPanel},
  {value: "images", label: "Images", Component: ImagesPanel},
  {value: "reels", label: "Reels", Component: ReelsPanel}
];

// TODO: Replace hardcoded values with proper search fields
const BADGES = [
  {label: "Object", color: "yellow"},
  {label: "Celebrity", color: "orange"},
  {label: "Landmark", color: "green"},
  {label: "Logo", color: "aqua"},
  {label: "Summary", color: "violet"},
  {label: "Speech", color: "blue"},
];

const FilterToolbar = observer(() => {
  const iconProps = {
    style: {width: "20px", height: "20px", display: "block"}
  };

  const [view, setView] = useState("grid");

  return (
    <Group mb={16} justify="space-between">
      <Group>
        <Group gap={6}>
          {
            BADGES.map(item => (
              <Badge
                key={item.label}
                color={item.color}
                variant="dot"
                label={item.label}
              />
            ))
          }
        </Group>
        <Select
          placeholder="Clip Duration"
          data={["1", "2"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Select
          placeholder="Rating"
          data={["1", "2"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Text size="sm">
          {
            Pluralize({
              baseWord: "Result",
              count: searchStore.currentSearch.results.contents.length
            })
          }
        </Text>
      </Group>
      <SegmentedControl
        value={view}
        onChange={setView}
        data={[
          {
            value: "list",
            label: (
              <>
                <ListIcon {...iconProps} />
                <VisuallyHidden>List Layout</VisuallyHidden>
              </>
            )
          },
          {
            value: "grid",
            label: (
              <>
                <GridIcon {...iconProps} />
                <VisuallyHidden>Grid Layout</VisuallyHidden>
              </>
            )
          }
        ]}
      />
    </Group>
  );
});

const TabContent = observer(({loadingSearch}) => {
  if(loadingSearch || !searchStore.currentSearch?.results?.contents) { return null; }
  const results = searchStore.currentSearch?.results?.contents;

  return (
    <Tabs defaultValue={SEARCH_TABS[1].value}>
      <Tabs.List justify="center" mb={24}>
        {
          SEARCH_TABS.map(tab => (
            <Tabs.Tab
              value={tab.value}
              key={tab.value}
              classNames={{tabLabel: tabStyles.label, tab: tabStyles.tab}}
            >
              { tab.label }
            </Tabs.Tab>
          ))
        }
      </Tabs.List>
      <FilterToolbar />

      {
        SEARCH_TABS.map(tab => (
          <Tabs.Panel value={tab.value} key={tab.value}>
            <tab.Component results={results} />
          </Tabs.Panel>
        ))
      }
    </Tabs>
  );
});

const Search = observer(() => {
  const [loadingSearch, setLoadingSearch] = useState(false);

  return (
    <PageContainer title="AI Clip Search">
      <SearchBar
        loadingSearch={loadingSearch}
        setLoadingSearch={setLoadingSearch}
      />
      <TabContent loadingSearch={loadingSearch} />
    </PageContainer>
  );
});

export default Search;
