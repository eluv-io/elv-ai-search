import {ActionIcon, Box, Button, Grid, Group, Loader, Stack, Text, Title, Tooltip} from "@mantine/core";
import {ShareIcon, HollowStarIcon, FilledStarIcon, VideoEditorIcon, StreamIcon} from "@/assets/icons/index.js";
import {IconChevronDown, IconChevronUp, IconDownload} from "@tabler/icons-react";
import {searchStore, rootStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";
import {FormatRuntime, SplitCamelCase} from "@/utils/helpers.js";
import {useEffect, useState} from "react";
import {CAPTION_KEYS} from "@/utils/data.js";
import {useClipboard} from "@mantine/hooks";

const ImageInfo = observer(({info}) => {
  return (
    <Box mt={20} mb={20}>
      <Stack gap={0}>
        {
          CAPTION_KEYS.map(item => ({keyName: item.keyName, value: info[item.keyName]}))
            .filter(item => !!item.value)
            .map(item => (
            <Group key={item.keyName}>
              <Text c="elv-gray.9">{ item.keyName }:</Text>
              <Text c="elv-gray.9">{ item.value }</Text>
            </Group>
          ))
        }
      </Stack>
    </Box>
  );
});

const VideoInfo = observer(({info}) => {
  if(info._standard) {
    return (
      <Box mt={20} mb={20}>
        <Grid gutter="lg">
          <Grid.Col>
            {
              Object.keys(info || {})
                .filter(item => item !== "_standard")
                .map(keyName => (
                <Grid gutter={0} key={keyName}>
                  <Grid.Col span={4}>
                    <Text c="elv-gray.9">{ SplitCamelCase({string: keyName}) }:</Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Text c="elv-gray.9">{ info[keyName] }</Text>
                  </Grid.Col>
                </Grid>
              ))
            }
          </Grid.Col>
        </Grid>
      </Box>
    );
  } else {
    return <CanalVideoInfo info={info} />;
  }
});

// TODO: Remove Canal-specific info
const CanalVideoInfo = observer(({info}) => {
  return (
    <Box mt={20} mb={20}>
      <Grid gutter="lg">
        <Grid.Col span={8} pr={32}>
          <Group gap={36} mb={8}>
            <Text c="elv-neutral.3" size="xl" fw={700}>
              { (info.genre || []).join(", ") }
            </Text>
            <Text c="elv-neutral.3" size="xl" fw={700}>{ FormatRuntime({timeMins: info.duration}) }</Text>
            <Text c="elv-neutral.3" size="xl" fw={700}>{ info.year_of_production }</Text>
          </Group>
          <Text lh={1.45} c="elv-gray.9" size="md">{ info.synopsisDisplay }</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          {
            [
              {keyName: "Réalisateur", value: info.directorDisplay},
              {keyName: "Scénariste", value: info.writerDisplay},
              {keyName: "Language", value: info.language},
              {keyName: "Acteur", value: info.actorDisplay},
            ]
              .filter(item => !!item.value)
              .map(item => (
              <Grid gutter={0} key={item.keyName}>
                <Grid.Col span={4}>
                  <Text c="elv-gray.9">{ item.keyName }:</Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text c="elv-gray.9">{ item.value }</Text>
                </Grid.Col>
              </Grid>
            ))
          }
        </Grid.Col>
      </Grid>
    </Box>
  );
});

const InfoCard = observer(({show=false, info, loading, type}) => {
  const CARD_TYPES = {
    "VIDEO": <VideoInfo info={info} />,
    "IMAGE": <ImageInfo info={info} />
  };

  if(!show || !info) { return null; }

  if(loading) { return <Loader />; }

  if(Object.hasOwn(CARD_TYPES, type)) {
    return CARD_TYPES[type];
  }
});

const MediaTitleSection = observer(({
  title,
  openModal,
  HandleRating,
  currentStars,
  showInfoCard,
  setShowInfoCard,
  mediaType,
  TYPE_DATA
}) => {
  const [loading, setLoading] = useState(false);
  const clipboard = useClipboard({timeout: 2000});
  const [embedUrl, setEmbedUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  let star1icon = HollowStarIcon;
  let star2icon = HollowStarIcon;
  let star3icon = HollowStarIcon;

  if(currentStars === "RELEVANCY_1_STAR") {
    star1icon = FilledStarIcon;
  } else if(currentStars === "RELEVANCY_2_STAR") {
    star1icon = star2icon = FilledStarIcon;
  } else if(currentStars === "RELEVANCY_3_STAR") {
    star1icon = star2icon = star3icon = FilledStarIcon;
  }

  const tooltipStyles = {
    position: "bottom",
    c: "elv-gray.8",
    color: "elv-neutral.2"
  };

  const iconStyles = {
    bg: "elv-gray.1",
    color: "var(--mantine-color-elv-neutral-8)",
    width: 18
  };

  const hasInfoData = Object.keys((TYPE_DATA[mediaType]) || {}).length > 0;

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        await searchStore.GetTitleInfo();

        const {embedUrl: embed, downloadUrl: download} = await searchStore.GetShareUrls();

        setEmbedUrl(embed || "");
        setDownloadUrl(download || "");
      } finally {
        setLoading(false);
      }
    };

    if(!TYPE_DATA[mediaType]) {
      LoadData();
    }
  }, [searchStore.selectedSearchResult]);

  const HandleOpenInVideoEditor = async() => {
    const {id: objectId, qlib_id: libraryId, prefix, start_time, end_time} = searchStore.selectedSearchResult;

    const url = rootStore.GetVideoEditorUrl({
      libraryId,
      objectId,
      prefix,
      startTime: start_time === undefined ? undefined : (start_time / 1000),
      endTime: end_time === undefined ? undefined : (end_time / 1000)
    });

    window.open(url, "_blank");
  };

  return (
    <>
      <Group mb={8} wrap="nowrap">
        {
          title ?
            (
              <Group wrap="nowrap" style={{flexGrow: 1}} align="center" gap={6}>
                <Title order={2} c="elv-gray.8" lineClamp={1} style={{wordBreak: "break-all"}}>
                  { title }
                </Title>
                {
                  hasInfoData &&
                  <ActionIcon
                    size="md"
                    variant="subtle"
                    onClick={() => setShowInfoCard(prevState => !prevState)}
                    color="elv-neutral.6"
                    display="flex"
                  >
                    {
                      showInfoCard ? <IconChevronUp stroke={3} /> : <IconChevronDown stroke={3} />
                    }
                  </ActionIcon>
                }

                <Tooltip
                  label={clipboard.copied ? "Copied" : "Copy Object ID"}
                  position={tooltipStyles.position}
                  c={tooltipStyles.c}
                  color={tooltipStyles.color}
                >
                  <Button
                    color={iconStyles.bg}
                    style={{borderRadius: "30px"}}
                    maw={100}
                    onClick={() => clipboard.copy(searchStore.selectedSearchResult.id)}
                  >
                    <Text fz="xs" truncate="end" c={tooltipStyles.c}>
                      { searchStore.selectedSearchResult.id }
                    </Text>
                  </Button>
                </Tooltip>
              </Group>
            ) : null
        }

        <Group style={{flexShrink: 0, flexGrow: 0, marginLeft: "auto"}}>
          <Group gap="1" bg="elv-gray.1" style={{borderRadius: "30px"}}>
            {
              [
                {Icon: star1icon, tooltipText: "Irrelevant", value: "RELEVANCY_1_STAR"},
                {Icon: star2icon, tooltipText: "Relevant", value: "RELEVANCY_2_STAR"},
                {Icon: star3icon, tooltipText: "Highly Relevant", value: "RELEVANCY_3_STAR"},
              ].map(({value, tooltipText, Icon}) => (
                <Tooltip
                  key={value}
                  label={tooltipText}
                  position={tooltipStyles.position}
                  c={tooltipStyles.c}
                  color={tooltipStyles.color}
                >
                  <ActionIcon
                    size="lg"
                    onClick={() => HandleRating(value)}
                    radius={30}
                    color={iconStyles.bg}
                  >
                    <Icon color={iconStyles.color} width={iconStyles.width} />
                  </ActionIcon>
                </Tooltip>
              ))
            }
          </Group>


          {/* Copy URL's*/}
          <Tooltip
            label={clipboard.copied ? "Copied" : "Copy Download URL"}
            position={tooltipStyles.position}
            c={tooltipStyles.c}
            color={tooltipStyles.color}
          >
            <ActionIcon
              size="lg"
              onClick={() => clipboard.copy(downloadUrl)}
              radius={30}
              color={iconStyles.bg}
            >
              <IconDownload color={iconStyles.color} width={iconStyles.width} />
            </ActionIcon>
          </Tooltip>
          {
            !searchStore.selectedSearchResult._assetType &&
            <Tooltip
              label={clipboard.copied ? "Copied" : "Copy Streaming URL"}
              position={tooltipStyles.position}
              c={tooltipStyles.c}
              color={tooltipStyles.color}
            >
              <ActionIcon
                size="lg"
                onClick={() => clipboard.copy(embedUrl)}
                radius={30}
                color={iconStyles.bg}
              >
                <StreamIcon color={iconStyles.color} width={iconStyles.width} />
              </ActionIcon>
            </Tooltip>
          }

          {/* External Links */}
          <Tooltip
            label="Open in Video Editor"
            position={tooltipStyles.position}
            c={tooltipStyles.c}
            color={tooltipStyles.color}
          >
            <ActionIcon
              size="lg"
              onClick={HandleOpenInVideoEditor}
              radius={30}
              color={iconStyles.bg}
            >
              <VideoEditorIcon color={iconStyles.color} width={iconStyles.width} />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label="Share"
            position={tooltipStyles.position}
            c={tooltipStyles.c}
            color={tooltipStyles.color}
          >
            <ActionIcon
              size="lg"
              onClick={openModal}
              radius={30}
              color={iconStyles.bg}
            >
              <ShareIcon color={iconStyles.color} width={iconStyles.width} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <InfoCard
        show={showInfoCard && hasInfoData}
        info={TYPE_DATA[mediaType]}
        loading={loading}
        type={mediaType}
      />
    </>
  );
});

export default MediaTitleSection;
