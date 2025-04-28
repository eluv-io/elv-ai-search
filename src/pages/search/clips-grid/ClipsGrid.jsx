import {
  AspectRatio,
  Box,
  Flex,
  Group,
  Image,
  Loader,
  Pagination, Select,
  SimpleGrid,
  Skeleton,
  Text,
  Title, Tooltip,
  UnstyledButton
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";
import {useNavigate} from "react-router-dom";
import {ScaleImage, TimeInterval} from "@/utils/helpers.js";
import {ApproveIcon, EyeIcon, MusicIcon} from "@/assets/icons/index.js";
import {useState} from "react";

const ImageContent = observer(({imageSrc, title}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if(imageSrc && !imageFailed) {
    return (
      <Skeleton visible={!loaded} w="100%" h="100%">
        <Image
          bg="elv-gray.1"
          key={imageSrc}
          radius="lg"
          loading="lazy"
          w="100%"
          h="100%"
          src={ScaleImage({url: imageSrc, width: 400})}
          onError={() => setImageFailed(true)}
          onLoad={() => setLoaded(true)}
        />
      </Skeleton>
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
  const {id, start_time: startTime, end_time: endTime, _assetType, _captionApproved} = clip;

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
            song &&
            <Box bg="elv-gray.1" p="4px 8px" style={{flexShrink: 0, borderRadius: "4px"}}>
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
        <Flex gap={4} direction="row" wrap="nowrap" align="center" mih={30.8}>
          <EyeIcon color="var(--mantine-color-elv-gray-3)" />
          {/* TODO: Replace hardcoded value with api response */}
          <Text c="var(--mantine-color-elv-gray-3)" size="xxs">527</Text>
          {
            song ?
            <Flex gap={3} ml={16} align="center" wrap="nowrap">
              <MusicIcon color="var(--mantine-color-elv-gray-3)" height={18} width={16} />
              <Text c="var(--mantine-color-elv-gray-3)" size="xxs" lineClamp={1}>
                { song }
              </Text>
            </Flex> : null
          }
          <Group mb={0} gap={4} ml="auto">
            {
              _assetType &&
              _captionApproved &&
              <Tooltip
                label="Approved"
                position="bottom"
                c="elv-gray.8"
                color="elv-neutral.2"
              >
                <ApproveIcon height={18} />
              </Tooltip>
            }
            {
              clip._score &&
              !song &&
              <Box bg="elv-gray.1" p="2px 6px" style={{flexShrink: 0, borderRadius: "4px"}}>
                <Text size="xxs" c="elv-neutral.5">
                  Score: { clip._score }
                </Text>
              </Box>
            }
          </Group>
        </Flex>
      </Flex>
    </UnstyledButton>
  );
});

const ClipsGrid = observer(({
  clips=[],
  song,
  cols=4,
  HandleNextPage
}) => {
  if(!clips) {
    clips = searchStore.searchResults || [];
  }

  const SetPage = async(page) => {
    try {
      searchStore.ToggleLoadingSearch();
      searchStore.SetPagination({page});
      await HandleNextPage({page: searchStore.pagination.currentPage});
    } finally {
      searchStore.ToggleLoadingSearch();
    }
  };

  const HandlePageSizeChange = async(value) => {
    try {
      searchStore.ToggleLoadingSearch();
      await searchStore.UpdatePageSize({pageSize: parseInt(value)});
    } finally {
      searchStore.ToggleLoadingSearch();
    }
  };

  const GetPageSizeOptions = () => {
    let options;
    if(searchStore.searchContentType === "IMAGES") {
      options = [35, 70, 105, 140];
    } else if(searchStore.searchContentType === "VIDEOS") {
      options = [20, 40, 60, 80];
    }

    return options.map(num => (
      {value: num.toString(), label: num.toString(), disabled: searchStore.pagination.searchTotal < num}
    ));
  };

  if(searchStore.loadingSearch) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <>
      {
        clips.length > 0 &&
        <Title c="elv-gray.8" size="1.5rem" mb={16}>
          { song }
        </Title>
      }
      <SimpleGrid cols={cols} spacing="lg">
        {
          clips.map((clip, i) => (
            <Clip
              key={`clip-result-${clip.id}-${clip.start_time}-${i}`}
              clip={clip}
              song={song}
            />
          ))
        }
      </SimpleGrid>

      {
        !searchStore.loadingSearch &&
        <Group gap={24} mt={48}>
          <Text>
            {
              `${searchStore.pagination.firstResult}-${searchStore.pagination.endResult} / ${searchStore.searchTotal}`
            }
          </Text>
          <Group ml="auto" align="center" gap={0}>
            <Text fz="sm" mr={8}>Results Per Page</Text>
            <Select
              w={75}
              disabled={searchStore.pagination.searchTotal <= searchStore.pagination.pageSize}
              data={GetPageSizeOptions()}
              value={searchStore.pagination.pageSize.toString()}
              onChange={HandlePageSizeChange}
              size="xs"
              mr={16}
            />
            <Pagination
              total={searchStore.pagination.totalPages}
              onChange={SetPage}
              value={searchStore.pagination.currentPage}
            />
          </Group>
        </Group>
      }
    </>
  );
});

export default ClipsGrid;
