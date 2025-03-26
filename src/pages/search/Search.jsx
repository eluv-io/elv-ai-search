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
import ClipsList from "@/pages/search/clips-list/ClipsList.jsx";
import Content from "@/pages/search/content/Content.jsx";

const FilterToolbar = observer(({loadingSearch, resultsView, setResultsView}) => {
  const iconProps = {
    style: {width: "20px", height: "20px", display: "block"}
  };

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
        {
          searchStore.searchContentType === "VIDEOS" &&
          <Select
            placeholder="Clip Duration"
            data={["1", "2"]}
            size="xs"
            classNames={{root: styles.selectRoot, input: styles.selectInput}}
          />
        }
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
        value={resultsView}
        onChange={setResultsView}
        data={[
          {
            value: "LIST",
            label: (
              <>
                <ListIcon {...iconProps} />
                <VisuallyHidden>List Layout</VisuallyHidden>
              </>
            )
          },
          {
            value: "GRID",
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

const SearchResults = observer(({HandleNextPage, resultsView}) => {
  const colCount = {
    video: 4,
    image: 7
  };

  if(searchStore.musicSettingEnabled) {
    return <MusicGrid />;
  }

  let cols, title;
  if(["ALL", "VIDEOS"].includes(searchStore.searchContentType)) {
    cols = colCount.video;
    title = "Videos";
  } else if(["ALL", "IMAGES"].includes(searchStore.searchContentType)) {
    cols = colCount.image;
    title = "Images";
  } else {
    return null;
  }

  // condition for images:
  // (searchStore.searchResults || searchStore.loadingSearch)

  return (
    searchStore.searchResults &&
    <>
      <Group mb={16}>
        <Title c="elv-gray.8" order={3} size="1.5rem">
          { title }
        </Title>
      </Group>
      {
        resultsView === "GRID" ?
          <ClipsGrid
            clips={searchStore.searchResults}
            cols={cols}
            HandleNextPage={HandleNextPage}
          /> :
          <ClipsList
            clips={searchStore.searchResults}
            HandleNextPage={HandleNextPage}
          />
      }
    </>
  );
});

const Search = observer(() => {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [fuzzySearchValue, setFuzzySearchValue] = useState("");
  const [resultsView, setResultsView] = useState("GRID");

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
      console.error(`Unable to retrieve results for index ${searchStore.currentSearch.index}`, error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const HandleNextPage = async({page=1}={}) => {
    try {
      const cachedResults = searchStore.GetPaginatedSearchResults({page});

      if(cachedResults) {
        searchStore.SetCurrentSearchResults({results: cachedResults});
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
      console.error(`Unable to retrieve results for index ${searchStore.currentSearch.index}`, error);
    }
  };

  return (
    <PageContainer>
      <SearchBar
        loadingSearch={loadingSearch}
        setLoadingSearch={setLoadingSearch}
        HandleSearch={HandleSearch}
        fuzzySearchValue={fuzzySearchValue}
        setFuzzySearchValue={setFuzzySearchValue}
      />
      <Content
        show={(!(searchStore.searchResults || []).length || loadingSearch)}
      />

      {/* Active search */}
      <FilterToolbar
        loadingSearch={loadingSearch}
        resultsView={resultsView}
        setResultsView={setResultsView}
      />
      <SearchResults
        HandleNextPage={HandleNextPage}
        resultsView={resultsView}
      />
    </PageContainer>
  );
});

export default Search;
