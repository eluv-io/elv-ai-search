import {observer} from "mobx-react-lite";
import {ActionIcon, AspectRatio, Box, SimpleGrid, Transition, Group, Loader, Title} from "@mantine/core";
import {ArrowLeftIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import {TimeInterval} from "@/utils/helpers.js";
import VideoActionsBar from "@/components/video-actions-bar/VideoActionsBar.jsx";
import {useDisclosure} from "@mantine/hooks";
import ShareModal from "@/pages/search/share-modal/ShareModal.jsx";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

const TitleGroup = ({title, loading}) => {
  if(!title && !loading) { return null; }

  return (
    <Group gap={4} mb={19} wrap="nowrap">
      <AiIcon />
      <Title
        order={2}
        c="elv-gray.8"
        lineClamp={1}
      >
        {
          loading ?
            <Group w="100%">
              Title in Progress
              <Loader size="xs" pr={50} />
            </Group> :
            `Title: ${title}`
        }
      </Title>
    </Group>
  );
};

const CreateVideoMain = observer(({
  openedSidebar,
  open,
  summaryResults,
  loading,
  selectedClip
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);

  if(!summaryResults && !loading) { return null; }

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
            objectId={selectedClip?.objectId}
            playoutParameters={{
              clipStart: selectedClip?.startTime / 1000,
              clipEnd: selectedClip?.endTime / 1000,
              ignoreTrimming: true
            }}
          />
        </AspectRatio>
      </Box>

      <VideoActionsBar
        openModal={openModal}
        subtitle={`${loading ? "Request in progress" : "Request completed"} - Create Summary & Highlights`}
      />

      <TitleGroup title={summaryResults?.title} loading={loading} />

      <TextCard
        title="Summary"
        id="Summary"
        text={summaryResults?.summary}
        mb={24}
        lineClamp={5}
        titleIcon={<AiIcon />}
        loading={loading}
      />

      <SimpleGrid cols={4}>
        <TextCard
          title="Topic"
          id="Topic"
          text="Strategies and Key Moments in the Rugby Showdown."
          titleIcon={<AiIcon />}
          loading={loading}
        />
        <TextCard
          title="Source Detail"
          text="Leinster Rugby vs Stade Rochelais: Jul 24,2023_110405_132541.mp4"
        />
        <TextCard
          title="Content ID"
          text={selectedClip?.objectId}
          copyable
        />
        <TextCard
          title="Time Interval"
          text={TimeInterval({startTime: selectedClip?.startTime, endTime: selectedClip?.endTime})}
        />
      </SimpleGrid>
      <ShareModal
        opened={openedShareModal}
        onClose={closeModal}
        objectId={selectedClip?.objectId}
        startTime={selectedClip?.startTime / 1000}
        endTime={selectedClip?.endTime / 1000}
      />
    </Box>
  );
});

export default CreateVideoMain;
