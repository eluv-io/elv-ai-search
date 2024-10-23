import {observer} from "mobx-react-lite";
import {Box, CloseButton, Flex, Group, ScrollArea, Tabs, Transition} from "@mantine/core";
import HighlightsPanel from "@/pages/video-details/sidebar/tab-panels/highlights-panel/HighlightsPanel.jsx";
import TagsPanel from "@/pages/video-details/sidebar/tab-panels/tags-panel/TagsPanel.jsx";
import styles from "../VideoDetails.module.css";
import SummaryPanel from "@/pages/video-details/sidebar/tab-panels/summary-panel/SummaryPanel.jsx";
import {useRef} from "react";
import {SLIDER_VALUES} from "@/utils/constants.js";
import VideoDetailsSlider from "@/components/video-details-slider/VideoDetailsSlider.jsx";

const DETAILS_TABS = [
  {value: "summary", label: "Description", Component: SummaryPanel},
  {value: "highlights", label: "Highlights", Component: HighlightsPanel},
  {value: "tags", label: "Tags", Component: TagsPanel}
  // {value: "music", label: "Music", Component: MusicPanel, hidden: !searchStore.musicSettingEnabled},
];

const VideoDetailsSidebar = observer(({opened, close}) => {
  const tabRef = useRef(null);
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
            flex="0 0 415px"
            miw="415px"
            maw="415px"
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
                      h="90%"
                    >
                      <VideoDetailsSlider sliderValues={SLIDER_VALUES} mb={13} />
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
