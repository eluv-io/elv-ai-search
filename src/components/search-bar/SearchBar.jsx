import {ActionIcon, Flex, Loader, TextInput} from "@mantine/core";
import styles from "@/components/search-bar/SearchInput.module.css";
import SearchIndexDropdown from "@/pages/search/SearchIndexDropdown.jsx";
import {useEffect, useState} from "react";
import {searchStore, tenantStore} from "@/stores/index.js";
import {SubmitIcon, PaperClipIcon} from "@/assets/icons";

const SearchBar = ({
  loadingSearch,
  setLoadingSearch,
  setResults
}) => {
  // Loaders
  const [loadingIndexes, setLoadingIndexes] = useState(true);

  // Data
  const [indexes, setIndexes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [fuzzySearchValue, setFuzzySearchValue] = useState("");

  useEffect(() => {
    const LoadData = async() => {
      const indexes = await tenantStore.GetTenantIndexes();
      setIndexes(indexes);
      setLoadingIndexes(false);
    };

    LoadData();
  }, []);

  if(loadingIndexes) { return <Loader />; }

  const HandleSearch = async() => {
    if(!(fuzzySearchValue || selectedIndex)) { return; }

    try {
      setLoadingSearch(true);

      const searchResults = await searchStore.GetSearchResults({
        fuzzySearchValue,
        objectId: selectedIndex,
        searchVersion: tenantStore.searchIndexes[selectedIndex]?.version
      });

      setResults(searchResults);
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
