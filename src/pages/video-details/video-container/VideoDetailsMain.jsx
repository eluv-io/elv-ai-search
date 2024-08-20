import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  AspectRatio,
  Box,
  SimpleGrid,
  Transition
} from "@mantine/core";
import {ArrowLeftIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import {TimeInterval} from "@/utils/helpers.js";
import {useDisclosure} from "@mantine/hooks";
import ShareModal from "@/pages/search/share-modal/ShareModal.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import VideoActionsBar from "@/components/video-actions-bar/VideoActionsBar.jsx";

const VideoDetailsMain = observer(({
  clip,
  openedSidebar,
  open,
  buttonStyles,
  textStyles,
  iconStyles
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);

  return (
    <Box pos="relative" pr={24} pl={24}>
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
                {...buttonStyles}
                style={{
                  opacity: openedSidebar ? 0 : 1,
                  zIndex: 10,
                  transitionStyle
                }}
              >
                <ArrowLeftIcon {...iconStyles} />
              </ActionIcon>
            )}
          </Transition>
        }
        <AspectRatio ratio={16 / 9}>
          <Video
            objectId={clip.id}
            playoutParameters={{
              clipStart: clip.start_time / 1000,
              clipEnd: clip.end_time / 1000,
              ignoreTrimming: true
            }}
            // Callback={({video, player}) => videoStore.SetVideo({video, player, objectId: clip.id, startTime: clip.start_time, endTime: clip.end_time})}
          />
        </AspectRatio>
      </Box>

      <VideoActionsBar
        title={clip.meta?.public?.asset_metadata?.title || clip.id}
        buttonStyles={buttonStyles}
        iconStyles={iconStyles}
        textStyles={textStyles}
        openModal={openModal}
      />

      <TextCard title="Summary" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis risus, consectetur et iaculis ac, gravida at lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur in malesuada quam, vel pretium est. Nullam scelerisque enim nec leo consequat, vitae efficitur quam consequat. Proin vel rutrum est. Phasellus condimentum sit amet turpis ut mollis. Proin ut malesuada mi. Morbi lorem tellus, interdum tempor diam eget, tempus luctus velit." mb={24} lineClamp={5} />

      <SimpleGrid cols={3}>
        <TextCard
          title="Content ID"
          text={clip.id}
          copyable
          iconStyles={iconStyles}
        />
        <TextCard
          title="Time Interval"
          text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
        />
        <TextCard
          title="Source URL"
          text={clip.url}
          copyable
          iconStyles={iconStyles}
        />
      </SimpleGrid>
      <ShareModal
        opened={openedShareModal}
        onClose={closeModal}
        objectId={clip.id}
        startTime={clip.start_time / 1000}
        endTime={clip.end_time / 1000}
      />
    </Box>
  );
});

export default VideoDetailsMain;
