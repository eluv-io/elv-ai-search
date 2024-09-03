import {observer} from "mobx-react-lite";
import {Box, CloseButton, Flex, Group, ScrollArea, Tabs, Transition} from "@mantine/core";
import HighlightsPanel from "@/pages/video-details/sidebar/tab-panels/highlights-panel/HighlightsPanel.jsx";
import TagsPanel from "@/pages/video-details/sidebar/tab-panels/tags-panel/TagsPanel.jsx";
import styles from "../VideoDetails.module.css";
import SummaryPanel from "@/pages/video-details/sidebar/tab-panels/summary-panel/SummaryPanel.jsx";
import MusicPanel from "@/pages/video-details/sidebar/tab-panels/music-panel/MusicPanel.jsx";
import {useRef} from "react";
import {searchStore} from "@/stores/index.js";
import {sliderValues} from "@/pages/video-details/VideoDetails.jsx";
import VideoDetailsSlider from "@/components/video-details-slider/VideoDetailsSlider.jsx";

const DETAILS_TABS = [
  {value: "tags", label: "Tags", Component: TagsPanel},
  {value: "summary", label: "Summary", Component: SummaryPanel},
  {value: "highlights", label: "Highlights", Component: HighlightsPanel},
  {value: "music", label: "Music", Component: MusicPanel, hidden: !searchStore.musicSettingEnabled}
];

const VideoDetailsSidebar = observer(({opened, close}) => {
  const HandleTabClick = (tabRef) => {
    tabRef.current.scrollIntoView();
  };

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
            // flex="0 0 385px"
            miw="385px"
            maw="385px"
            h="calc(100dvh - 150px)"
            pos="relative"
            opacity={opened ? 1 : 0}
            mr={24}
            pl={10}
            style={{
              ...transitionStyle,
              zIndex: 10
            }}
          >
            <Group
              pos="absolute"
              right={-5}
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
                      const tabRef = useRef(null);

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
                      h="90%"
                    >
                      <VideoDetailsSlider sliderValues={sliderValues} mb={13} />
                      <ScrollArea h="95%" type="auto" offsetScrollbars>
                        <tab.Component />
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

export default VideoDetailsSidebar;
