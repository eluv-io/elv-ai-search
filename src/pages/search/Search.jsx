import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Group, SegmentedControl, Select, Text, Title, UnstyledButton, VisuallyHidden} from "@mantine/core";
import SearchBar from "@/components/search-bar/SearchBar.jsx";
import {useState} from "react";
import {searchStore} from "@/stores/index.js";
import {GridIcon, ListIcon} from "@/assets/icons/index.js";
import styles from "./Search.module.css";
import GridItems from "@/components/items-grid/GridItems.jsx";
import MusicGrid from "@/pages/search/music-grid/MusicGrid.jsx";
import Content from "@/pages/content/Content.jsx";
import ListItems from "@/components/items-list/ListItems.jsx";

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

  const HandlePageSizeChange = async(value) => {
    try {
      searchStore.ToggleLoadingSearch();
      await searchStore.UpdatePageSize({pageSize: parseInt(value)});
    } finally {
      searchStore.ToggleLoadingSearch();
    }
  };

  const SetPage = async(page) => {
    try {
      searchStore.ToggleLoadingSearch();
      searchStore.SetPagination({page});
      await HandleNextPage({page: searchStore.pagination.currentPage});
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
          <GridItems
            clips={searchStore.searchResults}
            cols={cols}
            HandleSetPage={SetPage}
            HandlePageSizeChange={HandlePageSizeChange}
            loading={searchStore.loadingSearch}
            pagination={searchStore.pagination}
            pageSizeOptions={GetPageSizeOptions()}
          /> :
          <ListItems
            records={searchStore.searchResults}
            loading={searchStore.loadingSearch}
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
        show={
          !searchStore.activeSearch &&
          !loadingSearch &&
          !searchStore.musicSettingEnabled
        }
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
