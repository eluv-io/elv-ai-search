import {observer} from "mobx-react-lite";
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Loader,
  SimpleGrid,
  Transition
} from "@mantine/core";
import {ArrowLeftIcon} from "@/assets/icons/index.js";
import Video from "@/components/video/Video.jsx";
import {TimeInterval} from "@/utils/helpers.js";
import {useDisclosure} from "@mantine/hooks";
import ShareModal from "@/pages/result-details/share-modal/ShareModal.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import VideoTitleSection from "@/components/video-title-section/VideoTitleSection.jsx";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {useEffect, useRef, useState} from "react";
import {ratingStore, searchStore, summaryStore, videoStore} from "@/stores/index.js";
import PlayerParameters from "@eluvio/elv-player-js/lib/player/PlayerParameters.js";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";
import Overlay from "@/components/overlay/Overlay.jsx";

const MediaItem = ({
  clip
}) => {
  const mediaRef = useRef(null);

  const ContainerElement = ({children}) => {
    return (
      <Flex
        justify="center"
        mah="100%"
        h="100%"
        align="center"
        style={{flexGrow: 1}}
        pos="relative"
      >
        {
          mediaRef?.current &&
          <Overlay element={mediaRef.current} />
        }
        { children }
      </Flex>
    );
  };

  if(clip._assetType) {
    return (
      <ContainerElement>
        {/*<Flex*/}
        {/*  direction="column"*/}
        {/*  w="100%"*/}
        {/*  h="100%"*/}
        {/*  pos="absolute"*/}
        {/*  // flex="1 1 auto"*/}
        {/*>*/}
        {/*  <AspectRatio ratio={16 / 9}>*/}
        <Box w="100%">
          <Image
            ref={mediaRef}
            src={clip._imageSrc}
            fallbackSrc={`https://placehold.co/600x400?text=${clip.meta?.public?.asset_metadata?.title || clip.id}`}
            fit="contain"
            w="100%"
            // mah={800}
          />
        </Box>
          {/*</AspectRatio>*/}
        {/*</Flex>*/}
      </ContainerElement>
    );
  } else {
    return (
      <AspectRatio ratio={16 / 9}>
        <Video
          objectId={clip.id}
          playerOptions={{
            posterUrl: clip._imageSrc,
            autoplay: EluvioPlayerParameters.autoplay.OFF,
            hlsjsOptions: {
              fragLoadingTimeOut: 30000,
              maxBufferHole: 1.5
            },
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
    );
  }
};

const ResultDetailsMain = observer(({
  clip,
  openedSidebar,
  open
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentStars, setCurrentStars] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showInfoCard, setShowInfoCard] = useState(false);

  const searchTerm = searchStore.currentSearch.terms;
  const indexId = searchStore.currentSearch.index;
  const mediaRef = useRef(null);

  const SubmitRating = async(starRating) => {
    // set UI immediately
    setCurrentStars(starRating);

    try {
      await ratingStore.SetRatingResults({
        objectId: clip.id,
        versionHash: clip.hash,
        startTime: clip.start_time,
        endTime: clip.end_time,
        indexId: indexId,
        query: searchTerm,
        rating: starRating,
      });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log("Did not update rating store, reverting to previous state");
        setCurrentStars(currentStars);
    }
  };

  const GetInfo = async() => {
    if(!searchStore.selectedSearchResult?.info) {
      await searchStore.GetTitleInfo();
    }
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
      await GetInfo();
    };

    LoadData();
  }, []);

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
        <Flex>
          <MediaItem clip={clip} mediaRef={mediaRef} />
        </Flex>
      </Box>

      <VideoTitleSection
        title={clip._title}
        openModal={openModal}
        HandleRating={SubmitRating}
        currentStars={currentStars}
        showInfoCard={showInfoCard}
        setShowInfoCard={setShowInfoCard}
      />

      <Grid gap={8} mb={8}>
        {
          clip._assetType ? null :
          <Grid.Col span={4}>
            <TextCard
              text={TimeInterval({startTime: clip.start_time, endTime: clip.end_time})}
            />
          </Grid.Col>
        }
        <Grid.Col span={clip._assetType ? 10 : 4}>
          <TextCard
            text={clip.id}
            copyText={clip.id}
            lineClamp={1}
          />
        </Grid.Col>
        <Grid.Col span={clip._assetType ? 2 : 4}>
          <SimpleGrid cols={clip._assetType ? 1 : 2}>
            {
              clip._assetType ? null :
                <TextCard
                  text="Streaming"
                  centerText
                  copyText={embedUrl}
                />
            }
              <TextCard
                text="Download"
                centerText
                copyText={downloadUrl}
              />
          </SimpleGrid>
        </Grid.Col>
      </Grid>

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
                  prefix: clip.prefix,
                  assetType: clip._assetType,
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
                          endTime: clip.end_time,
                          prefix: clip.prefix,
                          assetType: clip._assetType,
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

export default ResultDetailsMain;
