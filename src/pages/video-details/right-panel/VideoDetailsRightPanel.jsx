import {observer} from "mobx-react-lite";
import {Box, Button, CloseButton, Group, Tabs, Transition} from "@mantine/core";
import HighlightsPanel from "@/pages/video-details/tab-panels/HighlightsPanel.jsx";
import TagsPanel from "@/pages/video-details/tab-panels/TagsPanel.jsx";
import SummaryPanel from "@/pages/video-details/tab-panels/SummaryPanel.jsx";
import styles from "../VideoDetails.module.css";
import {useDisclosure} from "@mantine/hooks";

const DETAILS_TABS = [
  {value: "tags", label: "Tags", Component: TagsPanel},
  {value: "summary", label: "Summary", Component: SummaryPanel},
  {value: "highlights", label: "Highlights", Component: HighlightsPanel}
];

const VideoDetailsRightPanel = observer(() => {
  const [opened, {open, close}] = useDisclosure(true);

  if(!opened) {
    return (
      <Button onClick={open} size="sm">
        Open
      </Button>
    );
  }

  return (
    <Transition mounted={opened}>
      {transitionStyle => (
        <Box
          flex="0 0 385px"
          h="100vh"
          pos="relative"
          data-open={opened}
          opacity={opened ? 1 : 0}
          style={{
            ...transitionStyle
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
  );
});

export default VideoDetailsRightPanel;
