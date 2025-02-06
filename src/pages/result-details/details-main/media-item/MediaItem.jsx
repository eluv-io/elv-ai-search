import {useRef, useState} from "react";
import {AspectRatio, Box, Flex, Image, Title} from "@mantine/core";
import Overlay from "@/components/overlay/Overlay.jsx";
import Video from "@/components/video/Video.jsx";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";
import PlayerParameters from "@eluvio/elv-player-js/lib/player/PlayerParameters.js";
import {videoStore} from "@/stores/index.js";

const MediaItem = ({clip}) => {
  const mediaRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);

  const ContainerElement = ({children}) => {
    return (
      <Flex
        justify="center"
        mah="100%"
        h="100%"
        mih={350}
        align="center"
        style={{flexGrow: 1}}
        pos="relative"
        bg="var(--mantine-color-elv-gray-2)"
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
        <Box w="100%" h="100%" style={{flexGrow: 1}}>
          {
            imageFailed ?
              (
                <Flex h="auto" w="100%" justify="center">
                  <Title c="elv-gray.7" order={1}>
                    { clip.meta?.public?.asset_metadata?.title || clip.id }
                  </Title>
                </Flex>
              ) :
              <Image
                ref={mediaRef}
                src={clip._imageSrc}
                fallbackSrc={`https://placehold.co/600x400?text=${clip.meta?.public?.asset_metadata?.title || clip.id}`}
                fit="contain"
                w="100%"
                h="auto"
                onError={() => setImageFailed(true)}
              />
          }
        </Box>
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

export default MediaItem;
