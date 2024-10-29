import {
  ActionIcon, Box,
  Button,
  Checkbox,
  Flex,
  Loader,
  Menu,
  Radio,
  Switch,
  Text,
  TextInput
} from "@mantine/core";
import {useEffect, useState} from "react";
import {searchStore, tenantStore} from "@/stores/index.js";
import {CameraIcon, DownArrowIcon, GearIcon, MusicIcon, SubmitIcon} from "@/assets/icons";
import {observer} from "mobx-react-lite";
import styles from "@/components/search-bar/SearchBar.module.css";

const IndexMenu = observer(({searchFields, HandleUpdateSearchField}) => {
  const [loadingIndexes, setLoadingIndexes] = useState(false);
  const [indexes, setIndexes] = useState([]);
  const [newIndex, setNewIndex] = useState("");
  const [indexMenuOpen, setIndexMenuOpen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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

  useEffect(() => {
    if(newIndex) {
      searchStore.SetSearchFields({index: newIndex});
    }
  }, [newIndex]);

  const allSearchFieldsSelected = Object.values(searchFields || {}).every(field => field.value);
  const noSearchFieldsSelected = Object.values(searchFields || {}).every(field => !field.value);

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
      <Menu.Dropdown p={24} style={{left: "300px"}}>
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

                <Button
                  onClick={() => setShowAdvancedOptions(prevState => !prevState)}
                  variant={showAdvancedOptions ? "light" : "white"}
                  color={showAdvancedOptions ? "elv-gray.8" : "elv-gray.6"}
                  leftSection={<GearIcon />}
                  mb={12}
                >
                  Advanced Settings
                </Button>
                {
                  showAdvancedOptions &&
                  <Box pl={12}>
                    <Text c="elv-gray.8" size="xl" fw={700} mb={8}>Searchable Fields</Text>
                    <Flex mb={12} direction="column">
                      {
                        searchStore.currentSearch.searchFields && searchFields ?
                          <>
                            <Checkbox
                              size="xs"
                              label="Select All"
                              checked={allSearchFieldsSelected} indeterminate={!allSearchFieldsSelected && !noSearchFieldsSelected}
                              onChange={() => HandleUpdateSearchField({field: "ALL"})}
                              mb={8}
                            />
                            {
                              Object.keys(searchFields || {}).map(fieldName => (
                                <Checkbox
                                  size="xs"
                                  key={fieldName}
                                  mb={8}
                                  ml={16}
                                  label={searchFields[fieldName]?.label}
                                  checked={searchFields[fieldName]?.value}
                                  onChange={event => {
                                    HandleUpdateSearchField({
                                      field: fieldName,
                                      value: event.target.checked
                                    });
                                  }}
                                />
                              ))
                            }
                          </> : null
                      }
                    </Flex>
                  </Box>
                }
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
  const [fuzzySearchValue, setFuzzySearchValue] = useState("");
  const [searchFields, setSearchFields] = useState(null);

  useEffect(() => {
    const {terms, searchFields: cachedSearchFields} = searchStore.currentSearch;
    if(terms) {
      setFuzzySearchValue(terms);
    }

    if(cachedSearchFields) {
      setSearchFields(cachedSearchFields);
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
      });

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
    let fields = searchFields;
    if(field === "ALL") {
      let newValue = true;
      if(Object.values(fields).every(item => item.value === true)) {
        newValue = false;
      }

      Object.keys(fields).forEach(item => {
        fields[item] = {
          ...fields[item],
          value: newValue
        };
      });
    } else {
      fields[field] = {
        ...fields[field],
        value
      };
    }

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
                <IndexMenu
                  searchFields={searchFields}
                  setSearchFields={setSearchFields}
                  HandleUpdateSearchField={HandleUpdateSearchField}
                />
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
    </Flex>
  );
});

export default SearchBar;
