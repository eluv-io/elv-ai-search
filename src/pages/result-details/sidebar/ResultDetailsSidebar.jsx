import {observer} from "mobx-react-lite";
import {Box, CloseButton, Flex, Group, ScrollArea, Skeleton, Stack, Tabs, Transition} from "@mantine/core";
import HighlightsPanel from "@/pages/result-details/sidebar/tab-panels/highlights-panel/HighlightsPanel.jsx";
import TagsPanel from "@/pages/result-details/sidebar/tab-panels/tags-panel/TagsPanel.jsx";
import styles from "../ResultDetails.module.css";
import SummaryPanel from "@/pages/result-details/sidebar/tab-panels/summary-panel/SummaryPanel.jsx";
import {useRef} from "react";
import {SLIDER_VALUES} from "@/utils/constants.js";
import VideoDetailsSlider from "@/components/video-details-slider/VideoDetailsSlider.jsx";
import {searchStore} from "@/stores/index.js";

const DETAILS_TABS = [
  {value: "summary", label: "Description", Component: SummaryPanel},
  {value: "highlights", label: "Highlights", Component: HighlightsPanel},
  {value: "tags", label: "Tags", Component: TagsPanel}
  // {value: "music", label: "Music", Component: MusicPanel, hidden: !searchStore.musicSettingEnabled},
];

const SkeletonContent = observer(({sidebarWidth}) => {
  return (
    <Box
      flex={`0 0 ${sidebarWidth}px`}
      miw={sidebarWidth}
      maw={sidebarWidth}
      h="calc(100dvh - 150px)"
      pos="relative"
      pl={0}
    >
      <Stack w="100%" gap={1}>
        <Skeleton height={45} mb={6} />
        {
          Array(5).fill(null).map((_, i) => (
            <Skeleton key={i} height={35} />
          ))
        }
      </Stack>
    </Box>
  );
});

const ResultDetailsSidebar = observer(({opened, close}) => {
  const tabRef = useRef(null);
  const HandleTabClick = (tabRef) => {
    tabRef.current.scrollIntoView();
  };
  const sidebarWidth = 415;

  if(searchStore.loadingSearchResult) {
    return <SkeletonContent sidebarWidth={sidebarWidth} />;
  }

  return (
    <>
        <Transition
          mounted={opened}
          transition={"slide-left"}
          duration={250}
          timingFunction="ease"
        >
        {transitionStyle => (
          <Box
            flex={`0 0 ${sidebarWidth}px`}
            miw={sidebarWidth}
            maw={sidebarWidth}
            h="calc(100dvh - 150px)"
            pos="relative"
            opacity={opened ? 1 : 0}
            pl={0}
            // pr={10}
            style={{
              ...transitionStyle,
              zIndex: 10
            }}
          >
            <Group
              pos="absolute"
              right={7}
              top={3}
            >
              <CloseButton onClick={close} style={{zIndex: 50}} />
            </Group>
            <Tabs defaultValue="tags" keepMounted={false} h="100%" style={{overflow: "hidden"}}>
              <Flex maw="90%">
                <Tabs.List
                  mb={12}
                  classNames={{list: styles.tabList}}
                >
                  {
                    DETAILS_TABS.map(tab => {

                      return (
                        <Tabs.Tab
                          ref={tabRef}
                          key={tab.value}
                          value={tab.value}
                          classNames={{
                            tabLabel: styles.tabLabel,
                            tab: styles.tab
                          }}
                          onClick={() => HandleTabClick(tabRef)}
                        >
                          {tab.label}
                        </Tabs.Tab>
                      );
                    })
                  }
                </Tabs.List>
              </Flex>

                {
                  (DETAILS_TABS).map(tab => (
                    <Tabs.Panel
                      key={tab.value}
                      value={tab.value}
                      h="100vh"
                    >
                      {
                        !searchStore.selectedSearchResult?._assetType &&
                        <VideoDetailsSlider sliderValues={SLIDER_VALUES} mb={13} />
                      }
                      <ScrollArea
                        h="calc(100vh - 250px)"
                        type="hover"
                        maw={sidebarWidth}
                        scrollbarSize={4}
                        offsetScrollbars
                      >
                        <Box w={sidebarWidth - 10} pr={10}>
                          <tab.Component />
                        </Box>
                      </ScrollArea>
                    </Tabs.Panel>
                  ))
                }
            </Tabs>
          </Box>
        )}
      </Transition>
    </>
  );
});

export default ResultDetailsSidebar;
