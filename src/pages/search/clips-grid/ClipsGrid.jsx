import {AspectRatio, Box, Flex, Group, SimpleGrid, Text, Title, UnstyledButton} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";
import {useNavigate} from "react-router-dom";
import Video from "@/components/video/Video.jsx";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";
import {TimeInterval} from "@/utils/helpers.js";
import {EyeIcon} from "@/assets/icons/index.js";

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
      <Flex direction="column" gap={6}>
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
            playerOptions={{
              controls: EluvioPlayerParameters.controls.OFF
            }}
            borderRadius="14px"
          />
        </AspectRatio>
        <Title order={4} lineClamp={1} mt={10} lh={1}>
          { clip.meta?.public?.asset_metadata?.title || id }
        </Title>
        <Box>
          <Text size="sm">
            { TimeInterval({startTime, endTime}) }
          </Text>
        </Box>
        <Group gap={4}>
          <EyeIcon color="var(--mantine-color-elv-gray-3)" />
          {/* TODO: Replace hardcoded value with api response */}
          <Text c="var(--mantine-color-elv-gray-3)" size="xs">527</Text>
        </Group>
      </Flex>
    </UnstyledButton>
  );
});

const ClipsGrid = observer(() => {
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

export default ClipsGrid;
