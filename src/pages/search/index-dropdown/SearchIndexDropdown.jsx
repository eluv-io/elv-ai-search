import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Button,
  Combobox,
  Flex,
  Loader,
  Radio,
  TextInput,
  Title,
  useCombobox
} from "@mantine/core";
import styles from "@/components/search-bar/SearchIndexDropdown.module.css";
import {musicStore} from "@/stores/index.js";
import {SubmitIcon} from "@/assets/icons/index.js";
import {useState} from "react";

const TextInputSection = observer(({
  loadingSearch,
  indexes,
  combobox,
  HandleSearch,
  selectedIndex,
  setSelectedIndex
}) => {
  return (
    <Combobox.Target
      size="md"
      data-single-field={musicStore.musicSettingEnabled}
      classNames={{input: styles.input, root: styles.root}}
    >
      <TextInput
        placeholder={indexes.length > 0 ? "Select or enter a search index object ID" : "Enter a search index object ID"}
        value={selectedIndex}
        onChange={(event) => {
          setSelectedIndex(event.currentTarget.value);
          combobox.toggleDropdown();
        }}
        onClick={() => combobox.openDropdown()}
        onFocus={() => combobox.openDropdown()}
        onKeyDown={(event) => {

          if (musicStore.musicSettingEnabled && event.key === "Enter") {
            event.preventDefault();
            HandleSearch(true);
          }
        }}
        rightSection={
          (selectedIndex !== "" && musicStore.musicSettingEnabled) ? (
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
            ) :
            indexes.length > 0 ?
              (
                <Combobox.Chevron />
              ) : null
        }
        rightSectionPointerEvents={selectedIndex === "" ? "none" : "all"}
      >
      </TextInput>
    </Combobox.Target>
  );
});

const SearchIndexDropdown = observer(({
  indexes,
  loadingIndexes,
  selectedIndex,
  setSelectedIndex,
  HandleSearch,
  loadingSearch
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });
  const [newIndex, setNewIndex] = useState("");

  const options = indexes.map(item => (
    <Combobox.Option
      value={item.id}
      key={item.id}
      active={newIndex.includes(item)}
      classNames={{option: styles.comboboxOption}}
    >
      <Radio
        classNames={{body: styles.radioBody}}
        label={item.name || item.id}
        description={item.name ? item.id : ""}
        checked={newIndex.includes(item.id)}
        value={newIndex}
        onChange={event => setNewIndex(event.target.value)}
      />
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={value => {
        setNewIndex(value);
      }}
    >
      {/* Dropdown menu for search indexes */}
      {
        indexes.length > 0 ?
          (
            <Combobox.Dropdown p={24}>
              <Title size="xs" mb={16}>Index</Title>
              <Combobox.Options>
                {
                  loadingIndexes ?
                    <Combobox.Empty>Loading...</Combobox.Empty>
                    : options
                }
              </Combobox.Options>
              <Flex justify="flex-end">
                <Button
                  mt={20}
                  onClick={() => {
                    setSelectedIndex(newIndex);
                    combobox.closeDropdown();
                  }}>
                  Apply
                </Button>
              </Flex>
            </Combobox.Dropdown>
          ) : null
      }

      {/* User-editable text field for index */}
      <TextInputSection
        loadingSearch={loadingSearch}
        indexes={indexes}
        combobox={combobox}
        HandleSearch={HandleSearch}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </Combobox>
  );
});

export default SearchIndexDropdown;
