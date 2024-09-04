import {observer} from "mobx-react-lite";
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Loader,
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
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {useState} from "react";
import {summaryStore, videoStore} from "@/stores/index.js";
import PlayerParameters from "@eluvio/elv-player-js/lib/player/PlayerParameters.js";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

const VideoDetailsMain = observer(({
  clip,
  openedSidebar,
  open
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState(null);

  return (
    <Box pos="relative" pr={24} pl={24}>
      <Box w="100%" mb={22} pos="relative" >
        {
          !openedSidebar &&
          <Transition mounted={!openedSidebar} transition="fade" enterDelay={350} exitDuration={100}>
            {transitionStyle => (
              <SecondaryButton
                pos="absolute"
                top={10}
                right={10}
                onClick={open}
                iconOnly
                Icon={ArrowLeftIcon}
                style={{
                  opacity: openedSidebar ? 0 : 1,
                  zIndex: 10,
                  transitionStyle
                }}
              />
            )}
          </Transition>
        }
        <AspectRatio ratio={16 / 9}>
          <Video
            objectId={clip.id}
            playerOptions={{
              posterUrl: clip._imageSrc,
              autoplay: EluvioPlayerParameters.autoplay.OFF
            }}
            playoutParameters={{
              clipStart: clip.start_time / 1000,
              clipEnd: clip.end_time / 1000,
              ignoreTrimming: true,
              permanentPoster: PlayerParameters.permanentPoster.ON
            }}
            Callback={({video, player}) => {
              videoStore.SetVideo({
                video,
                player,
                objectId: clip.id,
                startTime: clip.start_time,
                endTime: clip.end_time
              });
            }}
          />
        </AspectRatio>
      </Box>

      <VideoActionsBar
        title={clip.meta?.public?.asset_metadata?.title || clip.id}
        openModal={openModal}
      />

      <SimpleGrid cols={3} mb={24}>
        <TextCard
          title="Time Interval"
          text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
        />
        <TextCard
          title="Content ID"
          text={clip.id}
          copyable
        />
        <TextCard
          title="Source URL"
          text={clip.url}
          copyable
        />
      </SimpleGrid>

      <TextCard
        title={summary ? "Summary" : ""}
        text={summary || ""}
        lineClamp={8}
        topActions={[
          {
            text: "Regenerate",
            onClick: async () => {
              try {
                setLoadingSummary(true);
                setSummary(null);

                const results = await summaryStore.GetSummaryResults({
                  objectId: clip.id,
                  startTime: clip.start_time,
                  endTime: clip.end_time,
                  cache: false
                });

                setSummary(results.summary);
              } finally {
                setLoadingSummary(false);
              }
            }
          }
        ]}
      >
        {
          !summary &&
          (
            <Flex justify="center" mb={16} mt={12}>
              {
                loadingSummary ? <Loader /> :
                (
                  <Button
                    onClick={async() => {
                      try {
                        setLoadingSummary(true);

                        const results = await summaryStore.GetSummaryResults({
                          objectId: clip.id,
                          startTime: clip.start_time,
                          endTime: clip.end_time
                        });

                        setSummary(results.summary);
                      } finally {
                        setLoadingSummary(false);
                      }
                    }}
                  >
                    Generate Summary
                  </Button>
                )
              }
            </Flex>
          )
        }
      </TextCard>

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
