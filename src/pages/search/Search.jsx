import PageContainer from "@/components/page-container/PageContainer.jsx";
import {observer} from "mobx-react-lite";
import {Group, SegmentedControl, Select, Text, VisuallyHidden} from "@mantine/core";
import SearchBar from "@/components/search-bar/SearchBar.jsx";
import {useState} from "react";
import {searchStore} from "@/stores/index.js";
import {Pluralize} from "@/utils/helpers.js";
import {GridIcon, ListIcon} from "@/assets/icons/index.js";
import styles from "./Search.module.css";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";

const FilterToolbar = observer(() => {
  const iconProps = {
    style: {width: "20px", height: "20px", display: "block"}
  };

  const [view, setView] = useState("grid");

  return (
    <Group mb={16} justify="space-between">
      <Group>
        <Select
          placeholder="Clip Duration"
          data={["1", "2"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Select
          placeholder="View By Category"
          data={["Full Length Videos", "Clips", "Images", "Reels"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Select
          placeholder="Rating"
          data={["1", "2"]}
          size="xs"
          classNames={{root: styles.selectRoot, input: styles.selectInput}}
        />
        <Text size="sm">
          {
            Pluralize({
              baseWord: "Result",
              count: searchStore.currentSearch.results.contents.length
            })
          }
        </Text>
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

  return (
    <PageContainer title="AI Clip Search">
      <SearchBar
        loadingSearch={loadingSearch}
        setLoadingSearch={setLoadingSearch}
      />
      <FilterToolbar />
      <ClipsGrid />
    </PageContainer>
  );
});

export default Search;
