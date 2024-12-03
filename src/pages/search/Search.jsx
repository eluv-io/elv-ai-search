import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Group, SegmentedControl, Select, Text, Title, UnstyledButton, VisuallyHidden} from "@mantine/core";
import SearchBar from "@/components/search-bar/SearchBar.jsx";
import {useState} from "react";
import {searchStore} from "@/stores/index.js";
import {GridIcon, ListIcon} from "@/assets/icons/index.js";
import styles from "./Search.module.css";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";
import MusicGrid from "@/pages/search/music-grid/MusicGrid.jsx";

const FilterToolbar = observer(({loadingSearch, resultType, setResultType}) => {
  const iconProps = {
    style: {width: "20px", height: "20px", display: "block"}
  };

  const [view, setView] = useState("grid");

  if(!(searchStore.results?.video?.contents || searchStore.results?.image?.contents) || loadingSearch) { return null; }

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
            {label: "All Content", value: "ALL", disabled: true},
            {label: "Images", value: "IMAGES", disabled: true},
            {label: "Videos", value: "VIDEOS", disabled: true}
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
  const [resultType, setResultType] = useState( ((searchStore.searchType === "VIDEOS" ? searchStore.highScoreVideoResults : searchStore.highScoreImageResults) || []).length > 0 ? "HIGH_SCORE" : "ALL");
  const colCount = {
    video: 4,
    image: 7
  };
  const viewVideoCount = -1;
  const viewImageCount = -1;
  // TODO: When multi-search is supported, use limited view
  // const [viewVideoCount, setViewVideoCount] = useState(-1);
  // const [viewImageCount, setViewImageCount] = useState(-1);

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
                    {/* TODO: Add limited view when multi search is supported */}
                    {/*{*/}
                    {/*  searchStore.results?.video?.contents.length > colCount.video ?*/}
                    {/*    (*/}
                    {/*      <UnstyledButton onClick={() => setViewVideoCount(prevState => prevState === -1 ? colCount.video : -1)} classNames={{root: styles.textButton}}>*/}
                    {/*        <Group gap={8}>*/}
                    {/*          <Text size="sm" c="elv-neutral.3" tt="uppercase">*/}
                    {/*            { viewVideoCount === colCount.video ? "View All" : "View Less" }*/}
                    {/*          </Text>*/}
                    {/*          <ArrowRightIcon color="var(--mantine-color-elv-neutral-3)" />*/}
                    {/*        </Group>*/}
                    {/*      </UnstyledButton>*/}
                    {/*    ) : null*/}
                    {/*}*/}
                  </Group>
                <ClipsGrid
                  view={resultType}
                  clips={searchStore.results?.video?.contents}
                  highScoreResults={searchStore.highScoreVideoResults}
                  viewCount={viewVideoCount}
                />
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
                    {/* TODO: Add limited view when multi search is supported */}
                    {/*{*/}
                    {/*  searchStore.results?.images?.contents.length > colCount.image ?*/}
                    {/*    (*/}
                    {/*      <UnstyledButton onClick={() => setViewImageCount(prevState => prevState === -1 ? colCount.image : -1)} classNames={{root: styles.textButton}}>*/}
                    {/*        <Group gap={8}>*/}
                    {/*          <Text size="sm" c="elv-neutral.3" tt="uppercase">*/}
                    {/*            { viewImageCount === colCount.image ? "View All" : "View Less" }*/}
                    {/*          </Text>*/}
                    {/*          <ArrowRightIcon color="var(--mantine-color-elv-neutral-3)" />*/}
                    {/*        </Group>*/}
                    {/*      </UnstyledButton>*/}
                    {/*    ) : null*/}
                    {/*}*/}
                  </Group>
                <ClipsGrid
                  view={resultType}
                  clips={searchStore.results?.image?.contents}
                  viewCount={viewImageCount}
                  cols={colCount.image}
                  highScoreResults={searchStore.highScoreImageResults}
                />
                </>
              }
            </>
          )
      }
    </PageContainer>
  );
});

export default Search;
