import {observer} from "mobx-react-lite";
import {Box, Button, Flex, Group, Image, Loader, Pill, Text, UnstyledButton} from "@mantine/core";
import {useState} from "react";
import {highlightsStore, rootStore, searchStore, summaryStore} from "@/stores/index.js";
import ThumbnailCard from "@/components/thumbnail-card/ThumbnailCard.jsx";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

import {EluvioPlayerParameters, InitializeEluvioPlayer} from "@eluvio/elv-player-js";

const TitleGroup = ({title, aiGenerated=false, loading, ...props}) => {
  return (
    <Group gap={4} mb={13} {...props}>
      {
        aiGenerated &&
        <AiIcon />
      }
      <Group>
        <Text size="sm" fw={600} c="elv-gray.8">{ title }</Text>
        {
          loading &&
          <Loader size="xs" />
        }
      </Group>
    </Group>
  );
};

// Load video, seek to specified frame, make a blob URL out of that frame and open in new tab
const GetKeyFrame = async (keyFrame) => {
  const target = document.createElement("div");

  const player = await InitializeEluvioPlayer(
    target,
    {
      clientOptions: {
        client: rootStore.client,
        network: EluvioPlayerParameters.networks[rootStore.networkInfo.name === "main" ? "MAIN" : "DEMO"],
      },
      sourceOptions: {
        protocols: [EluvioPlayerParameters.protocols.HLS],
        playoutParameters: {
          versionHash: searchStore.selectedSearchResult.hash,
        }
      },
      playerOptions: {
        muted: EluvioPlayerParameters.muted.ON,
        autoplay: EluvioPlayerParameters.autoplay.OFF
      }
    },
  );

  // Wait until the player can play, set quality to highest, seek to keyframe, then generate image
  await new Promise((resolve, reject) => {
    let canPlay = false;
    let frameAcquired = false;
    player.controls.RegisterVideoEventListener("canplay", async () => {
      if(canPlay) {
        return;
      }

      canPlay = true;

      player.controls.RegisterVideoEventListener("seeked", async () => {
        try {
          if(frameAcquired) {
            return;
          }

          frameAcquired = true;

          const canvas = document.createElement("canvas");
          canvas.width = player.video.videoWidth;
          canvas.height = player.video.videoHeight;
          canvas.getContext("2d").drawImage(player.video, 0, 0, player.video.videoWidth, player.video.videoHeight);
          canvas.toBlob(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            window.open(downloadUrl, "_blank").focus();
          });

          resolve();
        } catch(error) {
          reject(error);
        }
      });

      // Ensure highest quality
      player.controls.SetQualityLevel(player.controls.GetQualityLevels().options[1].index);
      player.controls.Seek({time: keyFrame.start_time / 1000});
    });
  });

  player.Destroy();
};

const KeyFrameButton = observer(({keyFrame}) => {
  const [loading, setLoading] = useState(false);

  return (
    <UnstyledButton
      style={{display: "flex", alignItems: "center", justifyContent: "center", position: "relative"}}
      onClick={async () => {
        if(loading) { return; }

        setLoading(true);
        try {
          await GetKeyFrame(keyFrame);
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error("Failed to generate keyframe image:");
          // eslint-disable-next-line no-console
          console.error(error);
        } finally {
          setLoading(false);
        }
      }}
    >
      <Image
        src={keyFrame["_imageSrc"]}
        w="auto"
        fit="contain"
      />
      {
        !loading ? null :
          <Loader style={{position: "absolute"}} color="blue.2" />
      }
    </UnstyledButton>
  );
});

const HighlightsPanel = observer(() => {
  const [loading, setLoading] = useState(false);
  const clip = searchStore.selectedSearchResult;

  const HandleGenerate = async(cache=true) => {
    try {
      setLoading(true);

      await highlightsStore.GetHighlightsResults({
        objectId: clip.id,
        startTime: clip.start_time,
        endTime: clip.end_time,
        cache
      });

      await summaryStore.GetSummaryResults({
        objectId: clip.id,
        startTime: clip.start_time,
        endTime: clip.end_time,
        prefix: clip.prefix,
        assetType: clip._assetType,
        cache
      });

      await searchStore.GetTags(true);
    } finally {
      setLoading(false);
    }
  };

  if(loading) {
    return (
      <Box align="center" mt={8}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box>
      {
        !searchStore.selectedSearchResult?._highlights?.results ?
          (
            <Box align="center" mt={8}>
              <Button onClick={HandleGenerate}>Generate Highlights</Button>
            </Box>
          ) :
          (
            <>
              {/* Highlights */}
              <Box mb={16}>
                {
                  (searchStore.selectedSearchResult?._highlights?.results || []).map((item, i) => (
                    <ThumbnailCard
                      key={`thumbnail-${i}-${item.start_time}-${item.end_time}`}
                      path={item._imageSrc}
                      title={item.caption}
                      startTime={item.start_time}
                      endTime={item.end_time}
                      playable
                    />
                  ))
                }
              </Box>

              {/* Images */}
              {
                searchStore.selectedSearchResult?._highlights?.keyframes ?
                  (
                    <>
                      <TitleGroup title="Images">Images</TitleGroup>
                      {
                        (searchStore.selectedSearchResult?._highlights?.keyframes || []).map(keyFrame => (
                          <KeyFrameButton key={`keyframe-${keyFrame.start_time}`} keyFrame={keyFrame} />
                        ))
                      }
                    </>
                  ) : null
              }

              {/* Hashtags */}
              <TitleGroup
                title={summaryStore.loadingSummary ? "Suggested Hashtags in Progress" : "Suggested Hashtags"}
                mt={16}
                aiGenerated
              />
              {
                summaryStore.loadingSummary ? "" :
                searchStore.selectedSearchResult?._summary?.hashtags ?
                  <Flex wrap="wrap" direction="row" gap={8}>
                    {
                      (searchStore.selectedSearchResult?._summary?.hashtags || []).map(hashtag => (
                        <Pill key={hashtag}>{ hashtag }</Pill>
                      ))
                    }
                  </Flex> : "No results"
              }

              {/* Topics */}
              {
                (searchStore.selectedSearchResult?._topics_deduped || []).length > 0 ?
                  (
                    <>
                      <TitleGroup title="Suggested Topics" mt={16} aiGenerated />
                      <Flex wrap="wrap" direction="row" gap={8}>
                        {
                          searchStore.selectedSearchResult?._topics_deduped.map(topic => (
                            <Pill key={topic.text.join(", ")}>{ (topic.text || []).join(", ") }</Pill>
                          ))
                        }
                      </Flex>
                    </>
                  ) : null
              }

              <Flex mt={16} justify="center">
                <Button
                  onClick={async () => {
                    searchStore.UpdateSelectedSearchResult({key: "_highlights", value: null});

                    await HandleGenerate(false);
                  }}
                  size="xs"
                >
                  Regenerate Highlights
                </Button>
              </Flex>
            </>
          )
      }
    </Box>
  );
});

export default HighlightsPanel;
