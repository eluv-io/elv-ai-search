import {observer} from "mobx-react-lite";
import {ActionIcon, AspectRatio, Box, Group, Title, Transition} from "@mantine/core";
import {ArrowLeftIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import {TimeInterval} from "@/utils/helpers.js";
import VideoActionsBar from "@/components/video-actions-bar/VideoActionsBar.jsx";
import {useDisclosure} from "@mantine/hooks";
import ShareModal from "@/pages/search/share-modal/ShareModal.jsx";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

const CreateVideoMain = observer(({
  clip,
  openedSidebar,
  open
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);

  // TODO: Replace hardcoded data
  clip = {
    id: "iq__4yVggyxW5upfqaUveumGE4ijrwd",
    start_time: 4020000,
    end_time: 4035000,
    title: "Title: Astonishing Penalty Kick: A Rare Moment of Precision"
  };

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
            objectId={clip.id}
          />
        </AspectRatio>
      </Box>

      <VideoActionsBar
        openModal={openModal}
        subtitle="Request in progress - Create Summary & Highlights"
      />

      <Group gap={4} mb={19}>
        <AiIcon />
        <Title
          order={2}
          c="elv-gray.8"
          lineClamp={1}
        >
          { clip.title }
        </Title>
      </Group>

      <TextCard
        title="Summary"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis risus, consectetur et iaculis ac, gravida at lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur in malesuada quam, vel pretium est. Nullam scelerisque enim nec leo consequat, vitae efficitur quam consequat. Proin vel rutrum est. Phasellus condimentum sit amet turpis ut mollis. Proin ut malesuada mi. Morbi lorem tellus, interdum tempor diam eget, tempus luctus velit."
        mb={24}
        lineClamp={5}
        titleIcon={<AiIcon />}
      />

      <Group>
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
          text={clip.id}
          copyable
        />
        <TextCard
          title="Time Interval"
          text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
        />
      </Group>
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

export default CreateVideoMain;
