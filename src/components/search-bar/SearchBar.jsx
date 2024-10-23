import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  Loader,
  Menu,
  Radio,
  Switch,
  Text,
  TextInput
} from "@mantine/core";
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
        const tenantIndexes = await tenantStore.GetTenantIndexes();
        setIndexes(tenantIndexes || []);
        setLoadingIndexes(false);

        if(tenantIndexes && !searchStore.currentSearch.index) {
          const firstIndex = tenantIndexes?.[0]?.id;
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
      <Menu.Dropdown p={24} style={{left: "350px"}}>
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
  const [searchFields, setSearchFields] = useState(null);

  useEffect(() => {
    const {terms, searchFields} = searchStore.currentSearch;
    if(terms) {
      setFuzzySearchValue(terms);
    }

    if(searchFields) {
      setSearchFields(searchFields);
    }
  }, [searchStore.currentSearch.searchFields, searchStore.currentSearch.terms]);

  const HandleSearch = async() => {
    if(!(fuzzySearchValue || searchStore.currentSearch.index)) { return; }

    try {
      setLoadingSearch(true);

      searchStore.ResetSearch();
      const fuzzySearchFields = [];
      Object.keys(searchFields || {}).forEach(field => {
        if(searchFields[field].value) {
          fuzzySearchFields.push(field);
        }
      })

      await searchStore.GetSearchResults({
        fuzzySearchValue,
        fuzzySearchFields,
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

  const HandleUpdateSearchField = ({field, value}) => {
    const fields = searchFields;

    fields[field] = {
      ...fields[field],
      value
    };

    setSearchFields(fields);
  };

  return (
    <Flex direction="column">
      <Flex direction="row" align="center" mb={12} justify="center" w="100%">
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
      <Flex direction="row" align="center" justify="center" w="100%" mb={24}>
        <Flex w="70%" justify="center">
          <Flex direction="row" w="100%" wrap="wrap" justify="center" gap={8}>
            {
              searchStore.currentSearch.searchFields && searchFields ?
                (
                  Object.keys(searchFields || {}).map(fieldName => (
                    <Checkbox
                      size="xs"
                      key={fieldName}
                      mr={8}
                      label={searchFields[fieldName].label}
                      checked={searchFields[fieldName].value}
                      onChange={event => {
                        HandleUpdateSearchField({
                          field: fieldName,
                          value: event.target.checked
                        })
                      }}
                    />
                  ))
                ) : null
            }
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
});

export default SearchBar;
