import {observer} from "mobx-react-lite";
import {AspectRatio, SimpleGrid} from "@mantine/core";
import {NavLink} from "react-router-dom";
import Video from "@/components/video/Video.jsx";

const Clip = observer(({
  id,
  versionHash,
  // imageUrl,
  startTime,
  endTime
}) => {
  return (
    <NavLink to={`${id}`} key={`grid-item-${id}`}>
      {/* TODO: Replace Video with Image when /rep/frame is supported */}
      {/*<AspectRatio ratio={16 / 9}>*/}
      {/*  <Image*/}
      {/*    radius="lg"*/}
      {/*    src={image_url}*/}
      {/*  />*/}
      {/*</AspectRatio>*/}
      <AspectRatio ratio={16 / 9}>
        <Video
          versionHash={versionHash}
          playoutParameters={{
            clipStart: startTime / 1000,
            clipEnd: endTime / 1000,
            ignoreTrimming: true
          }}
        />
      </AspectRatio>
    </NavLink>
  );
});

const ClipsPanel = observer(({results}) => {
  const clips = results?.contents || [];

  return (
    <SimpleGrid cols={4} spacing="lg">
      {
        clips.map((clip) => (
          <Clip
            key={`clip-result-${clip.id}-${clip.start_time}`}
            imageUrl={clip.image_url}
            id={clip.id}
            versionHash={clip.hash}
            startTime={clip.start_time}
            endTime={clip.end_time}
          />
        ))
      }
    </SimpleGrid>
  );
});

export default ClipsPanel;
