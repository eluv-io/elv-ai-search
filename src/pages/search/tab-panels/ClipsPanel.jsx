import {observer} from "mobx-react-lite";
import {AspectRatio, SimpleGrid, UnstyledButton} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import Video from "@/components/video/Video.jsx";
import {searchStore} from "@/stores/index.js";

const Clip = observer(({
  clip
}) => {
  const navigate = useNavigate();
  const {id, hash: versionHash, start_time: startTime, end_time: endTime} = clip;

  return (
    <UnstyledButton
      href="#"
      onClick={() => {
        searchStore.SetSelectedSearchResult({result: clip});
        navigate(id);
      }}
      key={`grid-item-${id}`}
    >
      {/* TODO: Replace Video with Image when /rep/frame is supported */}
      {/*<AspectRatio ratio={16 / 9}>*/}
      {/*  <Image*/}
      {/*    radius="lg"*/}
      {/*    src={image_url}*/}
      {/*  />*/}
      {/*</AspectRatio>*/}
      <AspectRatio
        ratio={16 / 9}
        style={{borderRadius: "14px", overflow: "hidden"}}
      >
        <Video
          versionHash={versionHash}
          playoutParameters={{
            clipStart: startTime / 1000,
            clipEnd: endTime / 1000,
            ignoreTrimming: true
          }}
          borderRadius="14px"
        />
      </AspectRatio>
    </UnstyledButton>
  );
});

const ClipsPanel = observer(() => {
  const clips = searchStore.currentSearch?.results?.contents || [];

  return (
    <SimpleGrid cols={4} spacing="lg">
      {
        clips.map((clip) => (
          <Clip
            key={`clip-result-${clip.id}-${clip.start_time}`}
            clip={clip}
          />
        ))
      }
    </SimpleGrid>
  );
});

export default ClipsPanel;
