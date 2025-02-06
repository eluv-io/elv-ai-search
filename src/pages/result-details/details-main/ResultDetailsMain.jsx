import {observer} from "mobx-react-lite";
import {
  Box,
  Grid,
  SimpleGrid,
  Transition
} from "@mantine/core";
import {ArrowLeftIcon} from "@/assets/icons/index.js";
import {TimeInterval} from "@/utils/helpers.js";
import {useDisclosure} from "@mantine/hooks";
import ShareModal from "@/pages/result-details/share-modal/ShareModal.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import MediaTitleSection from "@/pages/result-details/details-main/media-title-section/MediaTitleSection.jsx";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {useEffect, useRef, useState} from "react";
import {ratingStore, searchStore} from "@/stores/index.js";
import AIContentSection from "@/pages/result-details/details-main/ai-content-section/AIContentSection.jsx";
import MediaItem from "@/pages/result-details/details-main/media-item/MediaItem.jsx";

const ResultDetailsMain = observer(({
  clip,
  openedSidebar,
  open
}) => {
  const [openedShareModal, {open: openModal, close: closeModal}] = useDisclosure(false);
  const [currentStars, setCurrentStars] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showInfoCard, setShowInfoCard] = useState(false);

  const searchTerm = searchStore.currentSearch.terms;
  const indexId = searchStore.currentSearch.index;
  const mediaRef = useRef(null);

  const TYPE_DATA = {
    "MUSIC": null,
    "IMAGE": searchStore.selectedSearchResult?._info_image,
    "VIDEO": searchStore.selectedSearchResult?._info_video
  };

  const mediaType = searchStore.musicSettingEnabled ? "MUSIC" : searchStore.selectedSearchResult?._assetType ? "IMAGE" : "VIDEO";

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
      console.error("Did not update rating store, reverting to previous state");
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
        <MediaItem clip={clip} mediaRef={mediaRef} />
      </Box>

      <MediaTitleSection
        title={clip._title}
        openModal={openModal}
        HandleRating={SubmitRating}
        currentStars={currentStars}
        showInfoCard={showInfoCard}
        setShowInfoCard={setShowInfoCard}
        mediaType={mediaType}
        TYPE_DATA={TYPE_DATA}
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

      <AIContentSection
        clip={clip}
        mediaType={mediaType}
      />
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
