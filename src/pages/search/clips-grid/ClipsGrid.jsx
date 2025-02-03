import {AspectRatio, Box, Flex, Group, Image, SimpleGrid, Text, Title, UnstyledButton} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";
import {useNavigate} from "react-router-dom";
import {ScaleImage, TimeInterval} from "@/utils/helpers.js";
import {EyeIcon, MusicIcon} from "@/assets/icons/index.js";
import {useState} from "react";

const ImageContent = observer(({imageSrc, title}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if(imageSrc && !imageFailed) {
    return (
      <Image
        bg="elv-gray.2"
        radius="lg"
        loading="lazy"
        src={ScaleImage({url: imageSrc, width: 400})}
        onError={() => setImageFailed(true)}
      />
    );
  } else {
    return (
      <Flex bg="black" align="center" justify="center" p={16}>
        <Text c="white" fz="sm" style={{whiteSpace: "pre-line", wordBreak: "break-word"}}>
          { title }
        </Text>
      </Flex>
    );
  }
});

const Clip = observer(({
  clip,
  song
 }) => {
  const navigate = useNavigate();
  const {id, start_time: startTime, end_time: endTime, _assetType} = clip;

  return (
    <UnstyledButton
      href="#"
      onClick={() => {
        searchStore.SetSelectedSearchResult({result: clip});
        navigate(id);
      }}
      key={`grid-item-${id}`}
    >
      <Flex direction="column" gap={6}>
        <AspectRatio
          ratio={clip._assetType ? (1 / 1) : (16 / 9)}
          style={{borderRadius: "14px", overflow: "hidden"}}
        >
          <ImageContent
            imageSrc={clip._imageSrc}
            title={clip._title}
          />
        </AspectRatio>
        <Flex wrap="nowrap" mt={10} align="center" justify="space-between">
          <Title order={4} lineClamp={1} lh={1.25} style={{wordBreak: "break-word"}} mr={4}>
            { clip._title }
          </Title>
          {
            clip._score &&
            <Box bg="elv-gray.4" p="4px 8px" style={{flexShrink: 0, borderRadius: "4px"}}>
              <Text fz="xs" c="elv-neutral.5">
                Score: { clip._score }
              </Text>
            </Box>
          }
        </Flex>
        {
          !_assetType &&
          <Box>
            <Text size="sm">
              { TimeInterval({startTime, endTime}) }
            </Text>
          </Box>
        }
        <Group gap={4} wrap="nowrap">
          <EyeIcon color="var(--mantine-color-elv-gray-3)" />
          {/* TODO: Replace hardcoded value with api response */}
          <Text c="var(--mantine-color-elv-gray-3)" size="xs">527</Text>
          {
            song ?
            <Flex gap={3} ml={16} align="center" wrap="nowrap">
              <MusicIcon color="var(--mantine-color-elv-gray-3)" height={18} width={16} />
              <Text c="var(--mantine-color-elv-gray-3)" size="xs" lineClamp={1}>
                { song }
              </Text>
            </Flex> : null
          }
        </Group>
      </Flex>
    </UnstyledButton>
  );
});

const ClipsGrid = observer(({
  clips=[],
  highScoreResults=[],
  song,
  view="HIGH_SCORE",
  // viewCount,
  cols=4
}) => {
  if(!clips) {
    clips = searchStore.results?.video?.contents || searchStore.results?.image?.contents || [];
  }

  const musicEnabled = searchStore.musicSettingEnabled;

  const FilterClips = ({clips}) => {
    if(musicEnabled) {
      return clips;
    } else {
      return view === "ALL" ? clips : highScoreResults;
        // .slice(0, viewCount);
    }
  };

  const filteredClips = FilterClips({clips});

  return (
    <>
      {
        filteredClips.length > 0 &&
        <Title c="elv-gray.8" size="1.5rem" mb={16}>
          { song }
        </Title>
      }
      <SimpleGrid cols={cols} spacing="lg">
        {
          filteredClips.map((clip, i) => (
            <Clip
              key={`clip-result-${clip.id}-${clip.start_time}-${i}`}
              clip={clip}
              song={song}
            />
          ))
        }
      </SimpleGrid>
    </>
  );
});

export default ClipsGrid;
