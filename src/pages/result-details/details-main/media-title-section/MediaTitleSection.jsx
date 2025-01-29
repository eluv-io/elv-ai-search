import {ActionIcon, Box, Grid, Group, Loader, Stack, Text, Title} from "@mantine/core";
import {ShareIcon, HollowStarIcon, FilledStarIcon, VideoEditorIcon} from "@/assets/icons/index.js";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import styles from "@/pages/result-details/details-main/media-title-section/MediaTitleSection.module.css";
import {IconChevronDown, IconChevronUp} from "@tabler/icons-react";
import {searchStore, rootStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";
import {FormatRuntime} from "@/utils/helpers.js";
import {useEffect, useState} from "react";

const ImageInfo = observer(({info}) => {
  return (
    <Box mt={20} mb={20}>
      <Stack gap={0}>
        {
          [
            {keyName: "Location", value: info.Location},
            {keyName: "Headline", value: info.Headline},
            {keyName: "File Name", value: info.filename},
            {keyName: "City", value: info.City},
            {keyName: "State", value: info.State},
            {keyName: "Source", value: info.Source},
          ]
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
  subtitle,
  openModal,
  HandleRating,
  currentStars,
  showInfoCard,
  setShowInfoCard,
  mediaType,
  TYPE_DATA
}) => {
  const [loading, setLoading] = useState(false);
  let star1icon = HollowStarIcon;
  let star2icon = HollowStarIcon;
  let star3icon = HollowStarIcon;

  if (currentStars === "RELEVANCY_1_STAR") {
    star1icon = FilledStarIcon;
  } else if (currentStars === "RELEVANCY_2_STAR") {
    star1icon = star2icon = FilledStarIcon;
  } else if (currentStars === "RELEVANCY_3_STAR") {
    star1icon = star2icon = star3icon = FilledStarIcon;
  }

  const hasInfoData = Object.keys((TYPE_DATA[mediaType]) || {}).length > 0;

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        await searchStore.GetTitleInfo();
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
              </Group>
            ) : null
        }
        {
          subtitle ?
            <Text fz="xs">{ subtitle }</Text> : null
        }
        <Group style={{flexShrink: 0, flexGrow: 0, marginLeft: "auto"}}>
          <Group gap="1" classNames={{root: styles.starBackground}}>
            <SecondaryButton size="lg" iconOnly Icon={star1icon} hoverText="Irrelevant" onClick={() => HandleRating("RELEVANCY_1_STAR")}/>
            <SecondaryButton size="lg" iconOnly Icon={star2icon} hoverText="Relevant" onClick={() => HandleRating("RELEVANCY_2_STAR")}/>
            <SecondaryButton size="lg" iconOnly Icon={star3icon} hoverText="Highly Relevant" onClick={() => HandleRating("RELEVANCY_3_STAR")}/>
          </Group>
          <SecondaryButton LeftIcon={VideoEditorIcon} onClick={HandleOpenInVideoEditor}>
            Open in Video Editor
          </SecondaryButton>
          <SecondaryButton LeftIcon={ShareIcon} onClick={openModal}>
            Share
          </SecondaryButton>
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
