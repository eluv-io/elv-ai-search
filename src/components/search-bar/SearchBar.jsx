import {ActionIcon, Button, Flex, Loader, Menu, Radio, Switch, Text, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import {searchStore, tenantStore} from "@/stores/index.js";
import {CameraIcon, DownArrowIcon, MusicIcon, SubmitIcon} from "@/assets/icons";
import {observer} from "mobx-react-lite";
import styles from "@/components/search-bar/SearchBar.module.css";

const IndexMenu = observer(() => {
  const [loadingIndexes, setLoadingIndexes] = useState(false);
  const [indexes, setIndexes] = useState([]);
  const [newIndex, setNewIndex] = useState("");
  const [indexMenuOpen, setIndexMenuOpen] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoadingIndexes(true);
        const indexes = await tenantStore.GetTenantIndexes();
        setIndexes(indexes);
        setLoadingIndexes(false);

        if(indexes && !searchStore.currentSearch.index) {
          const firstIndex = indexes?.[0]?.id;
          searchStore.SetSearchIndex({index: firstIndex});
          setNewIndex(firstIndex);
        } else if(searchStore.currentSearch.index) {
          setNewIndex(searchStore.currentSearch.index);
        }
      } finally {
        setLoadingIndexes(false);
      }
    };

    LoadData();
  }, []);

  return (
    <Menu
      opened={indexMenuOpen}
      onChange={setIndexMenuOpen}
      closeOnItemClick={false}
      offset={12}
    >
      <Menu.Target>
        <ActionIcon variant="transparent">
          <DownArrowIcon color="var(--mantine-color-elv-gray-5)" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown p={24} style={{left: "130px"}}>
        {
          loadingIndexes ?
            <Loader /> :
            indexes.length === 0 ? "No search indexes configured for this tenant." :
              <>
                <Text c="elv-gray.8" size="xl" fw={700}>Index</Text>
                <Radio.Group
                  value={newIndex}
                  onChange={setNewIndex}
                >
                  {
                    indexes.map(item => (
                      <Menu.Item
                        key={item.id}
                        mb={12}
                      >
                        <Radio
                          classNames={{body: styles.radioBody}}
                          label={item.name || item.id}
                          description={item.name ? item.id : ""}
                          value={item.id}
                        />
                      </Menu.Item>
                    ))
                  }
                </Radio.Group>
                <Flex justify="flex-end">
                  <Button onClick={() => {
                    searchStore.SetSearchIndex({index: newIndex});
                    setIndexMenuOpen(false);
                  }}>
                    Apply
                  </Button>
                </Flex>
              </>
        }
      </Menu.Dropdown>
    </Menu>
  );
});

const SearchBar = observer(({
  loadingSearch,
  setLoadingSearch
}) => {
  // Data
  const [fuzzySearchValue, setFuzzySearchValue] = useState("");

  useEffect(() => {
    const {terms} = searchStore.currentSearch;
    if(terms) {
      setFuzzySearchValue(terms);
    }
  }, [searchStore.currentSearchParams]);

  const HandleSearch = async() => {
    if(!(fuzzySearchValue || searchStore.currentSearch.index)) { return; }

    try {
      setLoadingSearch(true);

      searchStore.ResetSearch();
      await searchStore.GetSearchResults({
        fuzzySearchValue,
        objectId: searchStore.currentSearch.index,
        searchVersion: tenantStore.searchIndexes[searchStore.currentSearch.index]?.version,
        musicType: "all"
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to retrieve results for index ${searchStore.currentSearch.index}`, error);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <Flex direction="row" align="center" mb={24} justify="center" w="100%">
      <Flex w="70%" justify="center">
        <Flex w="100%" pos="relative" align="center">
          <TextInput
            w="100%"
            size="sm"
            placeholder="Enter search phrase or keyword"
            miw={"275px"}
            classNames={{input: styles.textInput}}
            value={fuzzySearchValue}
            onChange={event => setFuzzySearchValue(event.target.value)}
            onKeyDown={async (event) => {
              if(event.key === "Enter") {
                await HandleSearch();
              }
            }}
            leftSectionPointerEvents="all"
            leftSection={
              <IndexMenu />
            }
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
            rightSectionPointerEvents="all"
          />
          {
            !searchStore.musicSettingEnabled &&
            <ActionIcon variant="transparent" pos="absolute" className={styles.cameraIcon}>
              <CameraIcon color="var(--mantine-color-elv-gray-3)" />
            </ActionIcon>
          }
        </Flex>

        <Switch
          size="xxl"
          thumbIcon={searchStore.musicSettingEnabled ? <MusicIcon color="var(--mantine-color-elv-violet-3)" /> : <MusicIcon />}
          checked={searchStore.musicSettingEnabled}
          onChange={() => searchStore.ToggleMusicSetting()}
          ml={24}
        />
      </Flex>
    </Flex>
  );
});

export default SearchBar;
