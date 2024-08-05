import {CloseButton, Combobox, Flex, Group, Input, Text, useCombobox} from "@mantine/core";
import PaperclipIcon from "@/assets/icons/Paperclip.jsx";
import styles from "@/components/search-bar/SearchBar.module.css";
import {useState} from "react";

const SearchIndexDropdown = () => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });
  const [searchValue, setSearchValue] = useState("");

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
    >
      {/* Search index options */}
      <Combobox.Dropdown>
        <Combobox.Options>
          <Combobox.Option value="Test">
            <Group>
              <Flex direction="column">
                <Text fz="sm" fw={500}>
                  Test
                </Text>
                <Text fz="xs" opacity={0.6}>
                  iq__aaa
                </Text>
              </Flex>
            </Group>
          </Combobox.Option>
        </Combobox.Options>
      </Combobox.Dropdown>

      {/* Input for index */}
      <Combobox.Target
        classNames={{input: styles.comboboxInput, wrapper: styles.comboboxWrapper}}
      >
        <Input
          placeholder="Select or enter a search index object ID"
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.currentTarget.value);
            combobox.toggleDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          rightSection={
            searchValue !== "" ? (
              <CloseButton
                size="sm"
                onMouseDown={event => event.preventDefault()}
                onClick={() => setSearchValue("")}
                aria-label="Clear Value"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={searchValue === "" ? "none" : "all"}
        ></Input>
      </Combobox.Target>
    </Combobox>
  );
};

const SearchBar = () => {
  return (
    <Flex direction="row" align="center">
      <SearchIndexDropdown />

      {/* Input for search terms */}
      <Input
        placeholder="Search by image, video, or audio"
        leftSection={<PaperclipIcon />}
        classNames={{input: styles.searchInput, wrapper: styles.searchWrapper}}
      />
    </Flex>
  );
};

export default SearchBar;
