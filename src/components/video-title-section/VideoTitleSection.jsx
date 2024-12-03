import {Box, Button, Grid, Group, Loader, Text, Title} from "@mantine/core";
import {ShareIcon, HollowStarIcon, FilledStarIcon, VideoEditorIcon} from "@/assets/icons/index.js";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import styles from "@/components/video-title-section/VideoTitleSection.module.css";
import {IconChevronDown, IconChevronUp} from "@tabler/icons-react";
import {searchStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";
import {FormatRuntime} from "@/utils/helpers.js";

const InfoCard = observer(({show=false, info}) => {
  if(!show) { return null; }

  if(!info) { return <Loader />; }

  return (
    <Box mt={20} mb={20}>
      <Grid gutter="lg">
        <Grid.Col span={8} pr={32}>
          <Group gap={36} mb={8}>
            <Text c="elv-neutral.3" size="xl" fw={700}>
              { info.genre.join(", ") }
            </Text>
            <Text c="elv-neutral.3" size="xl" fw={700}>{ FormatRuntime({timeMins: info.duration}) }</Text>
            <Text c="elv-neutral.3" size="xl" fw={700}>{ info.year_of_production }</Text>
          </Group>
          <Text lh={1.45} c="elv-gray.9" size="md">{ info.synopsisDisplay }</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Grid gutter={0}>
            <Grid.Col span={4}>
              <Text c="elv-gray.9">Réalisateur:</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text c="elv-gray.9">{ info.directorDisplay }</Text>
            </Grid.Col>
          </Grid>
          <Grid gutter={0}>
            <Grid.Col span={4}>
              <Text c="elv-gray.9">Scénariste: </Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text c="elv-gray.9">{ info.writerDisplay }</Text>
            </Grid.Col>
          </Grid>
          <Grid gutter={0}>
            <Grid.Col span={4}>
              <Text c="elv-gray.9">Language:</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text c="elv-gray.9">{ info.language.join(", ") }</Text>
            </Grid.Col>
          </Grid>
          <Grid gutter={0}>
            <Grid.Col span={4}>
              <Text c="elv-gray.9">Acteur:</Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Text c="elv-gray.9">{ info.actorDisplay }</Text>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Box>
  );
});

const VideoTitleSection = observer(({
  title,
  subtitle,
  openModal,
  HandleRating,
  currentStars,
  showInfoCard,
  setShowInfoCard
}) => {
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

  const info = searchStore.selectedSearchResult?._info;

  return (
    <>
      <Group mb={8} wrap="nowrap">
        {
          title ?
            (
              <Group>
                <Title order={2} c="elv-gray.8" lineClamp={1} maw="70%" style={{wordBreak: "break-all"}}>
                  { title }
                </Title>
                <Button
                  ml={8}
                  rightSection={showInfoCard ? <IconChevronUp /> : <IconChevronDown />}
                  onClick={() => setShowInfoCard(prevState => !prevState)}
                  color="elv-neutral.4"
                >
                  Info
                </Button>
              </Group>
            ) : null
        }
        {
          subtitle ?
            <Text fz="xs">{ subtitle }</Text> : null
        }
        <Group style={{flexShrink: 0, marginLeft: "auto"}}>
          <Group gap="1" classNames={{root: styles.starBackground}}>
            <SecondaryButton size="lg" iconOnly Icon={star1icon} hoverText="Irrelevant" onClick={() => HandleRating("RELEVANCY_1_STAR")}/>
            <SecondaryButton size="lg" iconOnly Icon={star2icon} hoverText="Relevant" onClick={() => HandleRating("RELEVANCY_2_STAR")}/>
            <SecondaryButton size="lg" iconOnly Icon={star3icon} hoverText="Highly Relevant" onClick={() => HandleRating("RELEVANCY_3_STAR")}/>
          </Group>
          <SecondaryButton LeftIcon={VideoEditorIcon}>
            Open in Video Editor
          </SecondaryButton>
          <SecondaryButton LeftIcon={ShareIcon} onClick={openModal}>
            Share
          </SecondaryButton>
        </Group>
      </Group>
      <InfoCard
        show={showInfoCard}
        info={info}
      />
    </>
  );
});

export default VideoTitleSection;
