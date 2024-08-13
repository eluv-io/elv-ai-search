import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Tabs} from "@mantine/core";
import tabStyles from "./SearchTabs.module.css";
import ClipsPanel from "@/pages/search/tab-panels/ClipsPanel.jsx";
import FullVideosPanel from "@/pages/search/tab-panels/FullVideosPanel.jsx";
import ImagesPanel from "@/pages/search/tab-panels/ImagesPanel.jsx";
import ReelsPanel from "@/pages/search/tab-panels/ReelsPanel.jsx";
import SearchBar from "@/components/search-bar/SearchBar.jsx";
import {useState} from "react";
import {searchStore} from "@/stores/index.js";

const SEARCH_TABS = [
  {value: "full-length-vid", label: "Full Length Videos", Component: FullVideosPanel},
  {value: "clips", label: "Clips", Component: ClipsPanel},
  {value: "images", label: "Images", Component: ImagesPanel},
  {value: "reels", label: "Reels", Component: ReelsPanel}
];

const TabContent = observer(({loadingSearch}) => {
  // if(results.length === 0) { return null; }
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
