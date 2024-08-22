import {observer} from "mobx-react-lite";
import {ActionIcon, AspectRatio, Box, Group, SimpleGrid, Title, Transition} from "@mantine/core";
import {ArrowLeftIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import {TimeInterval} from "@/utils/helpers.js";
import VideoActionsBar from "@/components/video-actions-bar/VideoActionsBar.jsx";
import {useDisclosure} from "@mantine/hooks";
import ShareModal from "@/pages/search/share-modal/ShareModal.jsx";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

const CreateVideoMain = observer(({
  openedSidebar,
  open,
  summaryResults
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);

  if(!summaryResults) { return null; }

  return (
    <Box w="100%" pos="relative" p="43 24">
      <Box w="100%" mb={22} pos="relative" >
        {
          !openedSidebar &&
          <Transition mounted={!openedSidebar} transition="fade" enterDelay={350} exitDuration={100}>
            {transitionStyle => (
              <ActionIcon
                pos="absolute"
                top={10}
                right={10}
                onClick={open}
                radius={30}
                color="elv-gray.1"
                style={{
                  opacity: openedSidebar ? 0 : 1,
                  zIndex: 10,
                  transitionStyle
                }}
              >
                <ArrowLeftIcon color="var(--mantine-color-elv-neutral-5)" />
              </ActionIcon>
            )}
          </Transition>
        }
        <AspectRatio ratio={16 / 9}>
          <Video
            objectId={summaryResults._id}
            playoutParameters={{
              clipStart: summaryResults._startTime / 1000,
              clipEnd: summaryResults._endTime / 1000,
              ignoreTrimming: true
            }}
          />
        </AspectRatio>
      </Box>

      <VideoActionsBar
        openModal={openModal}
        subtitle="Request completed - Create Summary & Highlights"
      />

      <Group gap={4} mb={19} wrap="nowrap">
        <AiIcon />
        <Title
          order={2}
          c="elv-gray.8"
          lineClamp={1}
        >
          Title: { summaryResults.title }
        </Title>
      </Group>

      <TextCard
        title="Summary"
        text={summaryResults.summary}
        mb={24}
        lineClamp={5}
        titleIcon={<AiIcon />}
      />

      <SimpleGrid cols={4}>
        <TextCard
          title="Topic"
          text="Strategies and Key Moments in the Rugby Showdown."
          titleIcon={<AiIcon />}
        />
        <TextCard
          title="Source Detail"
          text="Leinster Rugby vs Stade Rochelais: Jul 24,2023_110405_132541.mp4"
        />
        <TextCard
          title="Content ID"
          text={summaryResults._id}
          copyable
        />
        <TextCard
          title="Time Interval"
          text={TimeInterval({startTime: summaryResults._startTime, endTime: summaryResults._endTime})}
        />
      </SimpleGrid>
      <ShareModal
        opened={openedShareModal}
        onClose={closeModal}
        objectId={summaryResults._id}
        startTime={summaryResults._startTime / 1000}
        endTime={summaryResults._endTime / 1000}
      />
    </Box>
  );
});

export default CreateVideoMain;
