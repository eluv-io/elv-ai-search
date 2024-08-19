import {observer} from "mobx-react-lite";
import {AspectRatio, Box, Flex, Modal, Stack, Tabs, Text} from "@mantine/core";
import styles from "./ShareModal.module.css";
import {LinkIcon, MailIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import ShareDetailsPanel from "@/pages/search/share-modal/tab-panels/ShareDetailsPanel.jsx";
import SharePlaybackPanel from "@/pages/search/share-modal/tab-panels/SharePlaybackPanel.jsx";
import ShareFormatPanel from "@/pages/search/share-modal/tab-panels/ShareFormatPanel.jsx";
import ShareAccessPanel from "@/pages/search/share-modal/tab-panels/ShareAccessPanel.jsx";
import ShareSocialPanel from "@/pages/search/share-modal/tab-panels/ShareSocialPanel.jsx";

const SHARE_TABS = [
  {value: "details", label: "Details", Component: ShareDetailsPanel},
  {value: "playback", label: "Playback", Component: SharePlaybackPanel},
  {value: "format", label: "Format", Component: ShareFormatPanel},
  {value: "access", label: "Access", Component: ShareAccessPanel},
  {value: "social", label: "Social", Component: ShareSocialPanel}
];

const ShareModal = observer(({
  objectId,
  startTime,
  endTime,
  opened,
  onClose
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Share"
      padding="26px"
    >
      <Box className={styles.grid}>
        <Flex direction="column">
          <Text fw={600} c="elv-gray.8" fz="md" mb={12}>Preview</Text>
          <Box mb={24}>
            <AspectRatio ratio={16 / 9} classNames={{root: styles.video}}>
              <Video
                objectId={objectId}
                playoutParameters={{
                  clipStart: startTime,
                  clipEnd: endTime,
                  ignoreTrimming: true
                }}
                // Callback={({video, player}) => videoStore.SetVideo({video, player, objectId: clip.id, startTime: clip.start_time, endTime: clip.end_time})}
              />
            </AspectRatio>

            <Box>
              <Flex direction="row" bg="elv-gray.2" p="12 16" classNames={{root: styles.bottomFlex}}>
                <Stack flex={1} gap={2}>
                  <Text fz="xs">Duration</Text>
                  <Text fz="sm">7m 42s</Text>
                </Stack>
                <Stack flex={1} gap={2}>
                  <Text fz="xs">Size</Text>
                  <Text fz="sm">548  MB (estimated)</Text>
                </Stack>
              </Flex>
            </Box>
          </Box>
          <Text fw={600} c="elv-gray.8" fz="md">Streaming URL</Text>
          <Flex direction="row" gap={10} mb={24}>
            <Text fz="xs" c="elv-neutral.5" truncate="end">https://core.v3.contentfabric.io/apps/Video%20Editor#/ilib4FtcGxjMK3rhTedA8MFb9KZoeTsyiq__3kZwtGLhgfUuFXAyupR1TGufHb1</Text>
            <LinkIcon width={50} />
            <MailIcon width={50} />
          </Flex>
          <Text fw={600} c="elv-gray.8" fz="md">Download URL</Text>
          <Flex direction="row" gap={10}>
            <Text fz="xs" c="elv-neutral.5" truncate="end">https://core.v3.contentfabric.io/apps/Video%20Editor#/ilib4FtcGxjMK3rhTedA8MFb9KZoeTsyiq__3kZwtGLhgfUuFXAyupR1TGufHb1</Text>
            <LinkIcon width={50} />
            <MailIcon width={50} />
          </Flex>
        </Flex>
        <Box>
          <Tabs defaultValue="access">
            <Tabs.List mb={24}>
              {
                SHARE_TABS.map(item => (
                  <Tabs.Tab value={item.value} key={`share-tabs-${item.value}`}>
                    { item.label }
                  </Tabs.Tab>
                ))
              }
            </Tabs.List>
            {
              SHARE_TABS.map(item => (
                <Tabs.Panel key={item.value} value={item.value}>
                  <item.Component />
                </Tabs.Panel>
              ))
            }
          </Tabs>
        </Box>
      </Box>
    </Modal>
  );
});

export default ShareModal;
