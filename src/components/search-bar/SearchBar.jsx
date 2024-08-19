import {ActionIcon, Flex, Loader, TextInput} from "@mantine/core";
import styles from "@/components/search-bar/SearchInput.module.css";
import SearchIndexDropdown from "@/pages/search/index-dropdown/SearchIndexDropdown.jsx";
import {useEffect, useState} from "react";
import {searchStore, tenantStore} from "@/stores/index.js";
import {SubmitIcon, PaperClipIcon} from "@/assets/icons";

const SearchBar = ({
  loadingSearch,
  setLoadingSearch
}) => {
  // Loaders
  const [loadingIndexes, setLoadingIndexes] = useState(false);

  // Data
  const [indexes, setIndexes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [fuzzySearchValue, setFuzzySearchValue] = useState("");

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoadingIndexes(true);
        const indexes = await tenantStore.GetTenantIndexes();
        setIndexes(indexes);
        setLoadingIndexes(false);
      } finally {
        setLoadingIndexes(false);
      }
    };

    if(!tenantStore.loadedIndexes) {
      LoadData();
    }
  }, [tenantStore.loadedIndexes]);

  useEffect(() => {
    const {index, terms} = searchStore.currentSearch;
    if(terms) {
      setFuzzySearchValue(terms);
    }

    if(index) {
      setSelectedIndex(index);
    }
  }, [searchStore.currentSearchParams]);

  if(loadingIndexes) { return <Loader />; }

  const HandleSearch = async() => {
    if(!(fuzzySearchValue || selectedIndex)) { return; }

    try {
      setLoadingSearch(true);

      await searchStore.GetSearchResults({
        fuzzySearchValue,
        objectId: selectedIndex,
        searchVersion: tenantStore.searchIndexes[selectedIndex]?.version
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to retrieve results for index ${selectedIndex}`, error);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <Flex direction="row" align="center" mb={24}>
      <SearchIndexDropdown
        indexes={indexes}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />

      {/* Input for search terms */}
      <TextInput
        placeholder="Search by image, video, or audio"
        value={fuzzySearchValue}
        onChange={event => setFuzzySearchValue(event.target.value)}
        onKeyDown={async (event) => {
          if(event.key === "Enter") {
            await HandleSearch();
          }
        }}
        leftSection={<PaperClipIcon />}
        classNames={{input: styles.input, root: styles.root}}
        rightSection={
        loadingSearch ?
          <Loader size="xs" color="gray.7" /> :
          (
            <ActionIcon
              aria-label="Submit search"
              variant="transparent"
              component="button"
              onClick={HandleSearch}
              c="gray.7"
            >
              <SubmitIcon />
            </ActionIcon>
          )
      }
        rightSectionPointerEvents={loadingSearch ? "none" : "all"}
      />
    </Flex>
  );
};

export default SearchBar;
