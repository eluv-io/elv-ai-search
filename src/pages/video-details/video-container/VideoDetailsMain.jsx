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
import {useEffect, useState} from "react";
import {ratingStore, searchStore, summaryStore, videoStore} from "@/stores/index.js";
import PlayerParameters from "@eluvio/elv-player-js/lib/player/PlayerParameters.js";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

const VideoDetailsMain = observer(({
  clip,
  openedSidebar,
  open
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentStars, setCurrentStars] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const searchTerm = searchStore.currentSearch.terms;
  const indexId = searchStore.currentSearch.index;

  const submitStars = async (upOrDown) => {

    // set UI immediately; failure to upload stars is not catastrophic and has no feedback
    setCurrentStars(upOrDown);

    await ratingStore.SetRatingResults({
      objectId: clip.id,
      startTime: clip.start_time,
      endTime: clip.end_time,
      indexId: indexId,
      query: searchTerm,
      rating: upOrDown,
    });
  };

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const stars = await ratingStore.GetRatingResults({
          objectId: clip.id,
          startTime: clip.start_time,
          endTime: clip.end_time,
          indexId: indexId,
          query: searchTerm,
        });
        setCurrentStars(stars?.feedback_item?.rating);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching stars:", error);
      }
    };

    fetchStars();
  }, [clip.id, clip.start_time, clip.end_time]);

  useEffect(() => {
    const LoadData = async () => {
      const {embedUrl: embed, downloadUrl: download} = await searchStore.GetShareUrls();

      setEmbedUrl(embed || "");
      setDownloadUrl(download || "");
    };

    LoadData();
  }, []);

  console.log("CURRENT THUMB COMP: " + currentStars)
  return (
    <Box pos="relative" pr={0} pl={0} style={{flexGrow: 1}}>
      <Box w="100%" mb={16} pos="relative" >
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
        onClick={submitStars}
        currentStars={currentStars}
      />

      <SimpleGrid cols={3} mb={8} gap={8}>
        <TextCard
          text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
        />
        <TextCard
          text={clip.id}
          copyText={clip.id}
          lineClamp={1}
        />
        <SimpleGrid cols={2} gap={16}>
          <TextCard
            text="Streaming"
            centerText
            copyText={embedUrl}
          />
          <TextCard
            text="Download"
            centerText
            copyText={downloadUrl}
          />
        </SimpleGrid>
      </SimpleGrid>

      <TextCard
        title={searchStore.selectedSearchResult?._summary ? searchStore.selectedSearchResult?._summary?.title || "Summary" : ""}
        text={searchStore.selectedSearchResult?._summary?.summary || ""}
        lineClamp={15}
        topActions={searchStore.selectedSearchResult?._summary ? [
          {
            text: "Regenerate Summary",
            onClick: async () => {
              try {
                setLoadingSummary(true);
                searchStore.UpdateSelectedSearchResult({key: "_summary", value: null});

                await summaryStore.GetSummaryResults({
                  objectId: clip.id,
                  startTime: clip.start_time,
                  endTime: clip.end_time,
                  cache: false
                });
              } finally {
                setLoadingSummary(false);
              }
            }
          }
        ] : []}
      >
        {
          !searchStore.selectedSearchResult?._summary &&
          (
            <Flex justify="center" mb={16} mt={12}>
              {
                loadingSummary ? <Loader /> :
                (
                  <Button
                    onClick={async() => {
                      try {
                        setLoadingSummary(true);

                        await summaryStore.GetSummaryResults({
                          objectId: clip.id,
                          startTime: clip.start_time,
                          endTime: clip.end_time
                        });
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
