import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Tabs} from "@mantine/core";
import tabStyles from "./SearchTabs.module.css";
import ClipsPanel from "@/pages/search/tab-panels/ClipsPanel.jsx";
import FullVideosPanel from "@/pages/search/tab-panels/FullVideosPanel.jsx";
import ImagesPanel from "@/pages/search/tab-panels/ImagesPanel.jsx";
import ReelsPanel from "@/pages/search/tab-panels/ReelsPanel.jsx";

const SEARCH_TABS = [
  {value: "full-length-vid", label: "Full Length Videos", Component: FullVideosPanel},
  {value: "clips", label: "Clips", Component: ClipsPanel},
  {value: "images", label: "Images", Component: ImagesPanel},
  {value: "reels", label: "Reels", Component: ReelsPanel}
];

const Search = observer(() => {
  return (
    <PageContainer title="AI Clip Search" showSearchBar>
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
              <tab.Component />
            </Tabs.Panel>
          ))
        }
      </Tabs>
    </PageContainer>
  );
});

export default Search;
