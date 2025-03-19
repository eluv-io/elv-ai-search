import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  CloseIcon,
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
import {CameraIcon, DownArrowIcon, GearIcon, MusicIcon, SubmitIcon} from "@/assets/icons";
import {observer} from "mobx-react-lite";
import styles from "@/components/search-bar/SearchBar.module.css";
import {useDebouncedValue} from "@mantine/hooks";

const AdvancedSection = observer(({
  show,
  loadingSearchFields,
  HandleUpdate,
  customIndexError,
  setCustomIndexError
}) => {
  if(!show) { return null; }

  const allSearchFieldsSelected = Object.values(searchStore.currentSearch.searchFields || {}).every(field => field.value);
  const noSearchFieldsSelected = Object.values(searchStore.currentSearch.searchFields || {}).every(field => !field.value);

  return (
    <Box pl={12}>
      <Text c="elv-gray.8" size="xl" fw={700} mb={8}>Custom Search Index</Text>
      <TextInput
        label="Search Index"
        description="This will replace any currently selected index from the generated list."
        placeholder="Enter Object ID (iq__ or hq__)"
        value={searchStore.customIndex}
        onChange={(event) => {
          searchStore.SetCustomIndex({index: event.target.value});
          setCustomIndexError("");
        }}
        error={customIndexError}
        mb={16}
        rightSection={
          searchStore.customIndex ?
          (
            <ActionIcon
              variant="subtle"
              aria-label="Clear Input"
              onClick={() => {
                searchStore.SetCustomIndex({index: ""});
              }}
            >
              <CloseIcon />
            </ActionIcon>
          ) : null
      }
        rightSectionPointerEvents={searchStore.customIndex ? "all" : "none"}
      />

      <Text c="elv-gray.8" size="xl" fw={700} mb={8}>Searchable Fields</Text>
      {
        loadingSearchFields ?
          <Loader /> :
          (
            <Flex mb={12} direction="column">
              {
                searchStore.currentSearch.searchFields ?
                  <>
                    <Checkbox
                      size="xs"
                      label="Select All"
                      checked={allSearchFieldsSelected} indeterminate={!allSearchFieldsSelected && !noSearchFieldsSelected}
                      onChange={() => HandleUpdate({field: "ALL"})}
                      mb={8}
                    />
                    {
                      Object.keys(searchStore.currentSearch.searchFields || {}).map(fieldName => (
                        <Checkbox
                          size="xs"
                          key={fieldName}
                          mb={8}
                          ml={16}
                          label={searchStore.currentSearch.searchFields[fieldName]?.label}
                          checked={searchStore.currentSearch.searchFields[fieldName]?.value}
                          onChange={event => {
                            HandleUpdate({
                              field: fieldName,
                              value: event.target.checked
                            });
                          }}
                        />
                      ))
                    }
                  </> : "None found"
              }
            </Flex>
          )
      }

      <Text c="elv-gray.8" size="xl" fw={700} mb={8}>Summary Style</Text>
      <Radio.Group
        value={searchStore.searchSummaryType}
        defaultValue="caption"
        onChange={(value) => {
          searchStore.SetSearchSummaryType({type: value});
        }}
      >
        <Radio
          label="Synopsis"
          value="synopsis"
          mb={16}
        />
        <Radio
          label="Caption"
          value="caption"
          mb={16}
        />
        <Radio
          label="Caption V2"
          value="caption2"
          mb={16}
        />
      </Radio.Group>

      <Text c="elv-gray.8" size="xl" fw={700} mb={8}>Version</Text>
      <Radio.Group
        value={searchStore.searchHostname}
        defaultValue="ai"
        onChange={(value) => {
          searchStore.SetSearchHostname({host: value});
        }}
      >
        <Radio
          label="AI 1"
          value="ai"
          mb={16}
        />
        <Radio
          label="AI 2"
          value="ai-02"
          mb={16}
        />
      </Radio.Group>
    </Box>
  );
});

const IndexMenu = observer(({HandleUpdateSearchField}) => {
  const [loadingIndexes, setLoadingIndexes] = useState(false);
  const [loadingSearchFields, setLoadingSearchFields] = useState(false);
  const [indexes, setIndexes] = useState([]);
  const [indexMenuOpen, setIndexMenuOpen] = useState(false);

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [debouncedValue] = useDebouncedValue(searchStore.customIndex, 500);
  const [customIndexError, setCustomIndexError] = useState("");

  const LoadFields = async({index}) => {
    try {
      setLoadingSearchFields(true);
      await searchStore.GetSearchFields({
        index
      });
    } finally {
      setLoadingSearchFields(false);
    }
  };

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoadingIndexes(true);
        const tenantIndexes = await tenantStore.GetTenantIndexes();
        setIndexes(tenantIndexes || []);
        setLoadingIndexes(false);

        if(tenantIndexes.length === 0) {
          setShowAdvancedOptions(true);
        }

        if(tenantIndexes && !searchStore.currentSearch.index) {
          const firstIndex = tenantIndexes?.[0]?.id;
          searchStore.SetSearchIndex({index: firstIndex});
        }
      } finally {
        setLoadingIndexes(false);
      }
    };

    LoadData();
  }, []);

  useEffect(() => {
    if(debouncedValue) {
      if(debouncedValue.startsWith("iq__") || debouncedValue.startsWith("hq__")) {
        LoadFields({index: debouncedValue});
      } else if(debouncedValue.length > 0) {
        setCustomIndexError("Invalid Object ID");
      }
    } else {
      setCustomIndexError("");
      LoadFields({index: searchStore.currentSearch.index});
    }
  }, [debouncedValue]);

  useEffect(() => {
    const index = searchStore.currentSearch.index;
    if(index) {
      if(searchStore.currentSearch.index) {
        LoadFields({index});
      }
    }
  }, [searchStore.currentSearch.index]);

  const ResetMenu = () => {
    if(searchStore.customIndex) {
      setShowAdvancedOptions(true);
    } else {
      setShowAdvancedOptions(false);
    }
  };

  return (
    <Menu
      opened={indexMenuOpen}
      onChange={setIndexMenuOpen}
      onClose={ResetMenu}
      closeOnItemClick={false}
      offset={12}
    >
      <Menu.Target>
        <ActionIcon variant="transparent">
          <DownArrowIcon color="var(--mantine-color-elv-gray-3)" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown p={24} style={{left: "300px"}}>
        {
          loadingIndexes ?
            <Loader /> :
              <>
                <Text c="elv-gray.8" size="xl" fw={700}>Index</Text>
                {
                  indexes.length === 0 ?
                    <Text size="sm" mb={16}>
                      No search indexes configured for this tenant. Please enter a custom index.
                    </Text> :
                    <Radio.Group
                      value={searchStore.currentSearch?.index}
                      onChange={(value) => {
                        searchStore.SetSearchIndex({index: value});
                      }}
                    >
                      {
                        indexes.map(item => (
                          <Menu.Item
                            key={item.id}
                            mb={12}
                            disabled={!!searchStore.customIndex}
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
                }

                <Button
                  onClick={() => setShowAdvancedOptions(prevState => !prevState)}
                  variant={showAdvancedOptions ? "light" : "white"}
                  color={showAdvancedOptions ? "elv-gray.8" : "elv-gray.6"}
                  leftSection={<GearIcon />}
                  mb={12}
                >
                  Advanced Settings
                </Button>
                <AdvancedSection
                  show={showAdvancedOptions}
                  loadingSearchFields={loadingSearchFields}
                  HandleUpdate={HandleUpdateSearchField}
                  customIndexError={customIndexError}
                  setCustomIndexError={setCustomIndexError}
                />
                <Flex justify="flex-end">
                  <Button onClick={() => {
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
  HandleSearch,
  fuzzySearchValue,
  setFuzzySearchValue
}) => {
  useEffect(() => {
    const {terms} = searchStore.currentSearch;
    if(terms) {
      setFuzzySearchValue(terms);
    }
  }, [searchStore.currentSearch.terms]);

  const HandleUpdateSearchField = ({field, value}) => {
    let fields = searchStore.currentSearch.searchFields;
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

    searchStore.SetSearchFields({fields});
  };

  return (
    <Flex direction="column">
      <Flex direction="row" align="center" mb={12} justify="center" w="100%">
        <Flex w="100%" pos="relative" align="center">
          <TextInput
            w="100%"
            size="lg"
            placeholder="Enter search phrase or keyword"
            miw={"275px"}
            classNames={{input: styles.textInput, section: styles.inputRightSection}}
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
                setSearchFields={() => searchStore.currentSearch.SetSearchFields()}
                HandleUpdateSearchField={HandleUpdateSearchField}
              />
            }
            rightSection={
              loadingSearch ?
                <Loader size="xs" color="gray.7" /> :
                (
                  <Group gap={16} wrap="nowrap">
                    {
                      !searchStore.musicSettingEnabled &&
                      <ActionIcon variant="transparent" className={styles.cameraIcdon} size="sm">
                        <CameraIcon color="var(--mantine-color-elv-gray-3)" />
                      </ActionIcon>
                    }
                    <ActionIcon
                      aria-label="Submit search"
                      variant="transparent"
                      component="button"
                      onClick={() => HandleSearch()}
                      c="gray.7"
                    >
                      <SubmitIcon />
                    </ActionIcon>
                  </Group>
                )
            }
            rightSectionPointerEvents="all"
          />
        </Flex>

        {
          searchStore.searchContentType !== "IMAGES" &&
          <Switch
            size="xxl"
            classNames={{track: styles.switchTrack, thumb: styles.switchThumb}}
            thumbIcon={searchStore.musicSettingEnabled ? <MusicIcon color="var(--mantine-color-elv-violet-3)" /> : <MusicIcon color="var(--mantine-color-elv-gray-3)" />}
            checked={searchStore.musicSettingEnabled}
            onChange={() => searchStore.ToggleMusicSetting()}
            bd={"none"}
            ml={24}
          />
        }
      </Flex>
    </Flex>
  );
});

export default SearchBar;
