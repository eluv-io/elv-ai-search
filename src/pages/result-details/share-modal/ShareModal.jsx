import {observer} from "mobx-react-lite";
import {
  AspectRatio,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Pill,
  Text,
  Title
} from "@mantine/core";
import styles from "./ShareModal.module.css";
import {ShareIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import {useEffect, useState} from "react";
import {summaryStore} from "@/stores/index.js";
import {TimeInterval} from "@/utils/helpers.js";
import TitleGroup from "@/components/title-group/TitleGroup.jsx";
import ShareSection from "@/pages/result-details/share-modal/share-section/ShareSection.jsx";

const SummaryHashtagsSection = observer(({
  objectId,
  startTime,
  endTime,
  prefix,
  assetType,
  summaryMeta
}) => {
  const [info, setInfo] = useState(summaryMeta);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadSummary = async() => {
      try {
        if(summaryMeta) { return; }

        setLoading(true);

        const summaryResults = await summaryStore.GetSummaryResults({
          objectId,
          startTime,
          endTime,
          prefix,
          assetType
        });

        setInfo(summaryResults);
      } finally {
        setLoading(false);
      }
    };

    LoadSummary();
  }, []);

  return (
    <>
      <Box bg="elv-gray.4" p={8} className={styles.textBox}>
        {
          loading ?
            <Loader size="sm" /> :
            <Text fw={400} c="elv-gray.8" lh={1.25}>{ info ? info.summary : "" }</Text>
        }
      </Box>
      {
        loading ?
          null :
          <>
            <TitleGroup
              title={"Suggested Hashtags"}
              mt={16}
              aiGenerated
            />
            <Flex wrap="wrap" direction="row" gap={8}>
              {
                (info?.hashtags || []).map(hashtag => (
                  <Pill key={hashtag} bg="white" bd="1px solid var(--mantine-color-elv-gray-3)" c="elv-gray.8" fz={14}>
                    { hashtag }
                  </Pill>
                ))
              }
            </Flex>
          </>
      }
    </>
  );
});

const ShareModal = observer(({
  objectId,
  startTime,
  title,
  endTime,
  summary,
  prefix,
  assetType,
  opened,
  onClose
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xxl"
      title={
        <Group gap={8} w="100%" wrap="nowrap">
          <ShareIcon height={22} width={22} className={styles.shareIcon} />
          <Title order={1} lineClamp={1}>Share {title}</Title>
        </Group>
      }
      padding="26px"
    >
      <Box className={styles.grid}>
        {/* Left column */}
        <Flex direction="column">
          <Box mb={24}>
            <AspectRatio ratio={16 / 9}>
              <Box className={styles.videoWrapper}>
                <Video
                  objectId={objectId}
                  playoutParameters={{
                    clipStart: startTime,
                    clipEnd: endTime,
                    ignoreTrimming: true
                  }}
                />
              </Box>
            </AspectRatio>

            <Box m="16 0 16">
              {
                ![undefined, null].includes(startTime) && ![undefined, null].includes(endTime) &&
                <Text c="elv-gray.9">
                  {
                    TimeInterval({
                      startTime: startTime / 1000,
                      endTime: endTime / 1000
                    })
                  }
                </Text>
              }
            </Box>
            <SummaryHashtagsSection
              objectId={objectId}
              startTime={startTime}
              endTime={endTime}
              assetType={assetType}
              prefix={prefix}
              summaryMeta={summary}
            />
          </Box>
        </Flex>

        {/* Right column */}
        <ShareSection />
      </Box>
      <Divider color="elv-gray.3" mt={60} mb={24} />

      <Flex justify="flex-end">
        <Button onClick={onClose} pl={43} pr={43}>Done</Button>
      </Flex>
    </Modal>
  );
});

export default ShareModal;
