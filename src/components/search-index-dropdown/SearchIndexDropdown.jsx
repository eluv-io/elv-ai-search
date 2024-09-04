import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Button,
  Flex,
  Loader,
  Menu,
  Radio,
  Text,
  TextInput,
  useCombobox
} from "@mantine/core";
import styles from "./SearchIndexDropdown.module.css";
import {searchStore, tenantStore} from "@/stores/index.js";
import {SubmitIcon} from "@/assets/icons/index.js";
import {useEffect, useState} from "react";

const SearchIndexDropdown = observer(({
  HandleSearch,
  loadingSearch,
  fuzzySearchValue,
  setFuzzySearchValue
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });
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
    <Flex
      classNames={{root: styles.inputFlexbox}}
      flex={3}
      align="center"
      pr={16}
      justify="space-between"
      data-single-field={searchStore.musicSettingEnabled}
    >
      <Flex align="center">
        <TextInput
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
        />

        {/* Search index menu */}
        <Menu
          opened={indexMenuOpen}
          onChange={setIndexMenuOpen}
          closeOnItemClick={false}
        >
          <Menu.Target>
            <Button variant="transparent">
              <Text c="elv-gray.5" fz="xs">
                &#9660;
              </Text>
            </Button>
          </Menu.Target>
          <Menu.Dropdown p={24}>
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
                    {/*{*/}
                    {/*  searchStore.musicSettingEnabled &&*/}
                    {/*    <Menu.Item mb={12}>*/}
                    {/*      <Radio*/}
                    {/*        label="All music"*/}
                    {/*      />*/}
                    {/*    </Menu.Item>*/}
                    {/*}*/}
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
      </Flex>
      {
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
    </Flex>
  );
});

export default SearchIndexDropdown;
