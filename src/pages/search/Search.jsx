import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Flex, Group, SegmentedControl, Select, Text, Title, UnstyledButton, VisuallyHidden} from "@mantine/core";
import SearchBar from "@/components/search-bar/SearchBar.jsx";
import {useState} from "react";
import {searchStore} from "@/stores/index.js";
import {ArrowRightIcon, GridIcon, ListIcon} from "@/assets/icons/index.js";
import styles from "./Search.module.css";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";
import MusicGrid from "@/pages/search/music-grid/MusicGrid.jsx";

const FilterToolbar = observer(({loadingSearch, resultType, setResultType}) => {
  const iconProps = {
    style: {width: "20px", height: "20px", display: "block"}
  };

  const [view, setView] = useState("grid");

  if(!searchStore.currentSearch.results || loadingSearch) { return null; }

  const ToggleResultType = () => {
    let newValue;

    if(resultType === "ALL") {
      newValue = "HIGH_SCORE";
    } else {
      newValue = "ALL";
    }

    setResultType(newValue);
  };

  return (
    <Group mb={16} justify="space-between">
      <Group>
        <Select
          placeholder="View By Category"
          data={[
            {label: "All Content", value: "ALL"},
            {label: "Images", value: "IMAGES"},
            {label: "Videos", value: "VIDEOS"}
          ]}
          value={searchStore.searchType}
          onChange={(value) => searchStore.SetSearchType({type: value})}
          defaultValue="All Content"
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Select
          placeholder="Clip Duration"
          data={["1", "2"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Select
          placeholder="Rating"
          data={["1", "2"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        {
          (searchStore.currentSearch?.terms) &&
          <UnstyledButton onClick={ToggleResultType} classNames={{root: styles.textButton}}>
            <Text size="sm" c="elv-neutral.5">
              {
                resultType === "ALL" ?
                  "Show Only High Score Results" :
                  "Show All Results"
              }
            </Text>
          </UnstyledButton>
        }
      </Group>
      <SegmentedControl
        value={view}
        onChange={setView}
        data={[
          {
            value: "list",
            label: (
              <>
                <ListIcon {...iconProps} />
                <VisuallyHidden>List Layout</VisuallyHidden>
              </>
            )
          },
          {
            value: "grid",
            label: (
              <>
                <GridIcon {...iconProps} />
                <VisuallyHidden>Grid Layout</VisuallyHidden>
              </>
            )
          }
        ]}
      />
    </Group>
  );
});

const Search = observer(() => {
  const [loadingSearch, setLoadingSearch] = useState(false);
  // Show all results vs top results that have a high score
  const [resultType, setResultType] = useState((searchStore.highScoreResults || []).length ? "HIGH_SCORE" : "ALL");
  const [viewVideoCount, setViewVideoCount] = useState(4);
  const [viewImageCount, setViewImageCount] = useState(4);

  return (
    <PageContainer title="AI Clip Search" centerTitle>
      <SearchBar
        loadingSearch={loadingSearch}
        setLoadingSearch={setLoadingSearch}
      />
      <FilterToolbar loadingSearch={loadingSearch} resultType={resultType} setResultType={setResultType} />
      {
        searchStore.musicSettingEnabled ?
          <MusicGrid view={resultType} /> :
          (
            <>
              {
                ["ALL", "VIDEOS"].includes(searchStore.searchType) &&
                searchStore.results?.video?.contents &&
                <>
                  <Group mb={16}>
                    <Title c="elv-gray.8" order={3} size="1.5rem">
                      Videos
                    </Title>
                    <UnstyledButton onClick={() => setViewVideoCount(prevState => prevState === -1 ? 4 : -1)} classNames={{root: styles.textButton}}>
                      <Group gap={8}>
                        <Text size="sm" c="elv-neutral.3" tt="uppercase">
                          { viewVideoCount === 4 ? "View All" : "View Less" }
                        </Text>
                        <ArrowRightIcon color="var(--mantine-color-elv-neutral-3)" />
                      </Group>
                    </UnstyledButton>
                  </Group>
                <ClipsGrid view={resultType} clips={searchStore.results?.video?.contents} viewCount={viewVideoCount} />
                </>
              }
              {
                ["ALL", "IMAGES"].includes(searchStore.searchType) &&
                searchStore.results?.image?.contents &&
                <>
                  <Group mb={16} mt={16}>
                    <Title c="elv-gray.8" order={3} size="1.5rem">
                      Images
                    </Title>
                    <UnstyledButton onClick={() => setViewImageCount(prevState => prevState === -1 ? 4 : -1)} classNames={{root: styles.textButton}}>
                      <Group gap={8}>
                        <Text size="sm" c="elv-neutral.3" tt="uppercase">
                          { viewImageCount === 4 ? "View All" : "View Less" }
                        </Text>
                        <ArrowRightIcon color="var(--mantine-color-elv-neutral-3)" />
                      </Group>
                    </UnstyledButton>
                  </Group>
                <ClipsGrid view={resultType} clips={searchStore.results?.image?.contents} viewCount={viewImageCount} />
                </>
              }
            </>
          )
      }
    </PageContainer>
  );
});

export default Search;
