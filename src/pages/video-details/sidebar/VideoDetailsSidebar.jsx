import {observer} from "mobx-react-lite";
import {Box, CloseButton, Group, Tabs, Transition} from "@mantine/core";
import HighlightsPanel from "@/pages/video-details/sidebar/tab-panels/HighlightsPanel.jsx";
import TagsPanel from "@/pages/video-details/sidebar/tab-panels/TagsPanel.jsx";
import SummaryPanel from "@/pages/video-details/sidebar/tab-panels/SummaryPanel.jsx";
import styles from "../VideoDetails.module.css";

const DETAILS_TABS = [
  {value: "tags", label: "Tags", Component: TagsPanel},
  {value: "summary", label: "Summary", Component: SummaryPanel},
  {value: "highlights", label: "Highlights", Component: HighlightsPanel}
];

const VideoDetailsSidebar = observer(({opened, close}) => {
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
            flex="0 0 385px"
            pos="relative"
            opacity={opened ? 1 : 0}
            mr={24}
            pl={10}
            style={{
              ...transitionStyle,
              zIndex: 10
            }}
          >
            <Group pos="absolute" right={-5} top={3}>
              <CloseButton onClick={close} style={{zIndex: 50}} />
            </Group>
            <Tabs defaultValue="tags">
              <Tabs.List>
                {
                  DETAILS_TABS.map(tab => (
                    <Tabs.Tab
                      key={tab.value}
                      value={tab.value}
                      classNames={{
                        tabLabel: styles.tabLabel,
                        tab: styles.tab
                      }}
                    >
                      { tab.label }
                    </Tabs.Tab>
                  ))
                }
              </Tabs.List>

              {
                DETAILS_TABS.map(tab => (
                  <Tabs.Panel key={tab.value} value={tab.value}>
                    <tab.Component />
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
