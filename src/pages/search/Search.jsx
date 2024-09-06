import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Group, SegmentedControl, Select, Text, UnstyledButton, VisuallyHidden} from "@mantine/core";
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
          data={["All Content", "Full Length Videos", "Clips", "Images", "Reels"]}
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
        {/*<Text size="sm">*/}
        {/*  {*/}
        {/*    Pluralize({*/}
        {/*      baseWord: "Result",*/}
        {/*      count: searchStore.currentSearch?.results?.contents?.length*/}
        {/*    })*/}
        {/*  }*/}
        {/*</Text>*/}
        <UnstyledButton onClick={ToggleResultType} classNames={{root: styles.textButton}}>
          <Text size="sm" c="elv-neutral.5">
            {
              resultType === "ALL" ?
                "Show Only High Score Results" :
                "Show All Results"
            }
          </Text>
        </UnstyledButton>
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
  const [resultType, setResultType] = useState("HIGH_SCORE");

  return (
    <PageContainer title="AI Clip Search" centerTitle>
      <SearchBar
        loadingSearch={loadingSearch}
        setLoadingSearch={setLoadingSearch}
      />
      {/*<SearchDropzone loadingSearch={loadingSearch} />*/}
      <FilterToolbar loadingSearch={loadingSearch} resultType={resultType} setResultType={setResultType} />
      {
        searchStore.musicSettingEnabled ?
          <MusicGrid /> :
          <ClipsGrid view={resultType} />
      }
    </PageContainer>
  );
});

export default Search;
