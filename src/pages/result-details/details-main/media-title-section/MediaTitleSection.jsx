import {ActionIcon, Box, Grid, Group, Loader, Stack, Text, Title, Tooltip} from "@mantine/core";
import {ShareIcon, HollowStarIcon, FilledStarIcon, VideoEditorIcon, LinkIcon} from "@/assets/icons/index.js";
import {IconChevronDown, IconChevronUp, IconCopy, IconDownload} from "@tabler/icons-react";
import {searchStore, rootStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";
import {FormatRuntime, HandleDownload, SplitCamelCase} from "@/utils/helpers.js";
import {useEffect, useState} from "react";
import MediaSecondaryInfo from "@/pages/result-details/details-main/media-secondary-info/MediaSecondaryInfo.jsx";
import {useClipboard} from "@mantine/hooks";
import UrlJoin from "url-join";

const ImageInfo = observer(() => {
  return (
    <Box mt={20} mb={20}>
      <Stack gap={0}>
        {
          Object.keys(searchStore.selectedSearchResult._info_image || {}).map(keyName => ({keyName, value: searchStore.selectedSearchResult._info_image[keyName]}))
            .filter(item => !!item.value)
            .map(item => (
            <Group key={item.keyName} style={{flexWrap: "nowrap"}} align="flex-start">
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
  const [embedUrl, setEmbedUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const clipboard = useClipboard({timeout: 2000});

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

  const hasInfoData = Object
    .keys((TYPE_DATA[mediaType]) || {})
    .filter(item => item !== "_standard")
    .length > 0;

  const ResetProps = () => {
    setShowInfoCard(false);
  };

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        await searchStore.GetTitleInfo();

        const {embedUrl: embed, downloadUrl: download} = await searchStore.GetShareUrls();

        setEmbedUrl(embed || "");
        setDownloadUrl(download || "");

        ResetProps();
      } finally {
        setLoading(false);
      }
    };

    if(!TYPE_DATA[mediaType]) {
      LoadData();
    }
  }, [searchStore.selectedSearchResult]);

  const HandleOpenInVideoEditor = async() => {
    const {id: objectId, prefix, start_time, end_time} = searchStore.selectedSearchResult;

    rootStore.client.SendMessage({
      options: {
        operation: "OpenLink",
        objectId,
        app: "video intelligence editor",
        path: UrlJoin("#", objectId, prefix || "", "tags"),
        params: {
          st: start_time === undefined ? undefined : (start_time / 1000),
          et: end_time === undefined ? undefined : (end_time / 1000),
          isolate: true
        }
      },
      noResponse: true
    });
  };

  return (
    <>
      <Group mb={8} wrap="nowrap" w="100%">
        {
          title ?
            (
              <Group wrap="nowrap" align="center" gap={6} flex="1 1 100%">
                <Title order={2} c="elv-gray.8" lineClamp={1} style={{wordBreak: "break-all"}} >
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
              </Group>
            ) : null
        }
        {
          searchStore.selectedSearchResult._assetType &&
          <Group gap={3} wrap="nowrap" w="100%" flex="1 1 100%" miw={0} justify="flex-start">
            <Text c="elv-gray.8" fw={400} size="sm" truncate="end">{ searchStore.selectedSearchResult.id }</Text>
            <Tooltip
              label={clipboard.copied ? "Copied" : "Copy ID"}
              position="bottom"
              c="elv-gray.8"
              color="elv-neutral.2"
            >
              <ActionIcon variant="transparent" onClick={() => clipboard.copy(searchStore.selectedSearchResult.id)}>
                <IconCopy
                  height={16}
                  color="var(--mantine-color-elv-gray-5)"
                />
              </ActionIcon>
            </Tooltip>
          </Group>
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
                    variant="subtle"
                  >
                    <Icon color={iconStyles.color} width={iconStyles.width} />
                  </ActionIcon>
                </Tooltip>
              ))
            }
          </Group>

          {
            searchStore.selectedSearchResult._assetType &&
            <Tooltip
              label="Download File"
              position="bottom"
              c="elv-gray.8"
              color="elv-neutral.2"
            >
              <ActionIcon
                color={iconStyles.bg}
                radius={30}
                size="lg"
                onClick={() => HandleDownload({downloadLink: downloadUrl})}
                rightSection={<LinkIcon color="var(--mantine-color-elv-gray-9)" />}
              >
                <IconDownload color={iconStyles.color} width={iconStyles.width} />
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
      <MediaSecondaryInfo embedUrl={embedUrl} downloadUrl={downloadUrl} />
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
