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

const FilterToolbar = observer(({loadingSearch}) => {
  const iconProps = {
    style: {width: "20px", height: "20px", display: "block"}
  };

  const [view, setView] = useState("grid");

  if(!(searchStore.searchResults || []).length || loadingSearch) { return null; }

  const ToggleResultType = () => {
    let newValue;

    if(searchStore.resultsViewType === "ALL") {
      newValue = "HIGH_SCORE";
    } else {
      newValue = "ALL";
    }

    searchStore.SetResultsViewType({value: newValue});
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
          value={searchStore.searchContentType}
          onChange={(value) => searchStore.SetSearchContentType({type: value})}
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
                searchStore.resultsViewType === "ALL" ?
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
  const [fuzzySearchValue, setFuzzySearchValue] = useState("");

  const colCount = {
    video: 4,
    image: 7
  };
  const viewVideoCount = -1;
  const viewImageCount = -1;
  // TODO: When multi-search is supported, use limited view
  // const [viewVideoCount, setViewVideoCount] = useState(-1);
  // const [viewImageCount, setViewImageCount] = useState(-1);

  const HandleSearch = async() => {
    if(!(fuzzySearchValue || searchStore.currentSearch.index)) { return; }

    try {
      setLoadingSearch(true);

      searchStore.ResetSearch();
      const fuzzySearchFields = [];
      Object.keys(searchStore.currentSearch.searchFields || {}).forEach(field => {
        if(searchStore.currentSearch.searchFields[field].value) {
          fuzzySearchFields.push(field);
        }
      });

      await searchStore.GetSearchResults({
        fuzzySearchValue,
        fuzzySearchFields,
        musicType: "all",
        page: 1
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to retrieve results for index ${searchStore.currentSearch.index}`, error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const HandleNextPage = async({page=1}={}) => {
    try {
      const cachedResults = searchStore.results?.imagePaginated?.[page];

      if(cachedResults) {
        searchStore.SetCurrentSearchResults({imageResults: cachedResults});
        return;
      } else {
        const fuzzySearchFields = [];
        Object.keys(searchStore.currentSearch.searchFields || {}).forEach(field => {
          if(searchStore.currentSearch.searchFields[field].value) {
            fuzzySearchFields.push(field);
          }
        });

        await searchStore.GetSearchResults({
          fuzzySearchValue,
          fuzzySearchFields,
          musicType: "all",
          page
        });
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to retrieve results for index ${searchStore.currentSearch.index}`, error);
    }
  };

  return (
    <PageContainer title="AI Content Search" centerTitle>
      <SearchBar
        loadingSearch={loadingSearch}
        setLoadingSearch={setLoadingSearch}
        HandleSearch={HandleSearch}
        fuzzySearchValue={fuzzySearchValue}
        setFuzzySearchValue={setFuzzySearchValue}
      />
      <FilterToolbar loadingSearch={loadingSearch} />
      {
        searchStore.musicSettingEnabled ?
          <MusicGrid /> :
          (
            <>
              {
                ["ALL", "VIDEOS"].includes(searchStore.searchContentType) &&
                searchStore.searchResults &&
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
                  view={searchStore.resultsViewType}
                  clips={searchStore.searchResults}
                  highScoreResults={searchStore.searchResults}
                  viewCount={viewVideoCount}
                />
                </>
              }
              {
                ["ALL", "IMAGES"].includes(searchStore.searchContentType) &&
                (searchStore.searchResults || searchStore.loadingSearch) &&
                <>
                  <Group mb={16} mt={16}>
                    <Title c="elv-gray.8" order={3} size="1.5rem">
                      Images
                    </Title>
                    {/* TODO: Add limited view when multi search is supported */}
                    {/*{*/}
                    {/*  searchStore.results?.images.length > colCount.image ?*/}
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
                    clips={searchStore.searchResults}
                    viewCount={viewImageCount}
                    cols={colCount.image}
                    HandleNextPage={HandleNextPage}
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
