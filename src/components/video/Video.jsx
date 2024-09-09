import {observer} from "mobx-react-lite";
import {useEffect, useState} from "react";
import {EluvioPlayerParameters, InitializeEluvioPlayer} from "@eluvio/elv-player-js";
import {rootStore} from "@/stores/index.js";
import {Box} from "@mantine/core";
import "@eluvio/elv-player-js/dist/elv-player-js.css";

const Video = observer(({
  versionHash,
  objectId,
  clientOptions={},
  sourceOptions={},
  playoutParameters={},
  playerOptions={},
  Callback
}) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    return () => {
      player?.Destroy();
    };
  }, []);

  useEffect(() => {
    // Reload player when id/hash changes
    if(player) {
      player.Destroy();
      setPlayer(null);
    }
  }, [objectId, versionHash, playoutParameters.clipEnd, playoutParameters.clipStart]);

  if(!(versionHash || objectId)) {
    // eslint-disable-next-line no-console
    console.warn("Unable to determine playout hash for video");
    return null;
  }

  return (
    <Box
      bg="black"
      ref={element => {
        if(!element || player) { return; }

        InitializeEluvioPlayer(
          element,
          {
            clientOptions: {
              client: rootStore.client,
              network: EluvioPlayerParameters.networks[rootStore.networkInfo.name === "main" ? "MAIN" : "DEMO"],
              ...clientOptions
            },
            sourceOptions: {
              protocols: [EluvioPlayerParameters.protocols.HLS, EluvioPlayerParameters.protocols.DASH],
              ...sourceOptions,
              playoutParameters: {
                versionHash,
                objectId,
                ...playoutParameters
              }
            },
            playerOptions: {
              watermark: EluvioPlayerParameters.watermark.OFF,
              muted: EluvioPlayerParameters.muted.ON,
              autoplay: EluvioPlayerParameters.autoplay.OFF,
              controls: EluvioPlayerParameters.controls.AUTO_HIDE,
              loop: EluvioPlayerParameters.loop.OFF,
              playerProfile: EluvioPlayerParameters.playerProfile.LOW_LATENCY,
              capLevelToPlayerSize: EluvioPlayerParameters.capLevelToPlayerSize.ON,
              ...playerOptions
            }
          },
        ).then(newPlayer => {
          window.player = newPlayer;
          setPlayer(newPlayer);
          if(Callback && typeof Callback === "function") {
            Callback({video: element, player: newPlayer});
          }
        });
      }}
    />
  );
});

export default Video;
