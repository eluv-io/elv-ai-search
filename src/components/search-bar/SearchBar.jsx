import {ActionIcon, Flex, Loader, Switch, TextInput} from "@mantine/core";
import styles from "@/components/search-bar/SearchInput.module.css";
import SearchIndexDropdown from "@/pages/search/index-dropdown/SearchIndexDropdown.jsx";
import {useEffect, useState} from "react";
import {musicStore, searchStore, tenantStore} from "@/stores/index.js";
import {SubmitIcon, PaperClipIcon, MusicIcon} from "@/assets/icons";
import {observer} from "mobx-react-lite";

const SearchBar = observer(({
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

    LoadData();
  }, []);

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

  const HandleSearch = async(music=false) => {
    if(!(fuzzySearchValue || selectedIndex)) { return; }

    try {
      setLoadingSearch(true);

      await searchStore.GetSearchResults({
        fuzzySearchValue,
        objectId: selectedIndex,
        searchVersion: tenantStore.searchIndexes[selectedIndex]?.version,
        music
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
        HandleSearch={HandleSearch}
        loadingSearch={loadingSearch}
      />

      {/* Input for search terms */}
      {
        musicStore.musicSettingEnabled ? null :
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
      }
      <Switch
        size="xl"
        thumbIcon={musicStore.musicSettingEnabled ? <MusicIcon color="var(--mantine-color-elv-violet-3)" /> : <MusicIcon />}
        checked={musicStore.musicSettingEnabled}
        onChange={() => musicStore.ToggleMusicSetting()}
        ml={24}
      />
    </Flex>
  );
});

export default SearchBar;
