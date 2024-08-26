import {AspectRatio, Box, Flex, Group, Image, SimpleGrid, Text, Title, UnstyledButton} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";
import {useNavigate} from "react-router-dom";
import {TimeInterval} from "@/utils/helpers.js";
import {EyeIcon} from "@/assets/icons/index.js";
import {useState} from "react";

const ImageContent = observer(({imageSrc, title}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if(imageSrc && !imageFailed) {
    return (
      <Image
        radius="lg"
        src={imageSrc}
        onError={() => setImageFailed(true)}
      />
    );
  } else {
    return (
      <Flex bg="black" align="center" justify="center" p={16}>
        <Text c="white" fz="sm">
          { title }
        </Text>
      </Flex>
    );
  }
});

const Clip = observer(({
   clip
 }) => {
  const navigate = useNavigate();
  const {id, start_time: startTime, end_time: endTime} = clip;

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
          <ImageContent
            imageSrc={clip._imageSrc}
            title={clip.meta?.public?.asset_metadata?.title || id}
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
