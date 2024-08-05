import {observer} from "mobx-react-lite";
import {CloseButton, Combobox, Flex, Group, Text, TextInput, useCombobox} from "@mantine/core";
import styles from "@/components/search-bar/SearchIndexDropdown.module.css";
import {useState} from "react";

const DropdownOption = observer(({id, name, direction="COLUMN"}) => {
  const flexProps = {
    align: direction === "COLUMN" ? "" : "baseline",
    gap: direction === "ROW" ? "8px" : 0,
    direction: direction === "COLUMN" ? "column" : "row"
  };

  return (
    <Group>
      <Flex {...flexProps}>
        <Text fz="sm" fw={500}>
          { name || id }
        </Text>
        <Text fz="xs" opacity={0.6}>
          { name ? id : "" }
        </Text>
      </Flex>
    </Group>
  );
});

const SearchIndexDropdown = observer(({indexes=[]}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  });
  const [index, setIndex] = useState("");

  const options = indexes.map(item => (
    <Combobox.Option value={item.id} key={item.id}>
      <DropdownOption {...item} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={value => {
        setIndex(value);
        combobox.closeDropdown();
      }}
    >
      {/* Search index options */}
      {
        indexes.length > 0 ?
          (
            <Combobox.Dropdown>
              <Combobox.Options>
                { options }
              </Combobox.Options>
            </Combobox.Dropdown>
          ) : null
      }

      {/* Input for index */}
      <Combobox.Target
        classNames={{input: styles.input, root: styles.root}}
      >
        <TextInput
          placeholder={indexes.length > 0 ? "Select or enter a search index object ID" : "Enter a search index object ID"}
          value={index}
          onChange={(event) => {
            setIndex(event.currentTarget.value);
            combobox.toggleDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          rightSection={
            index !== "" ? (
                <CloseButton
                  size="sm"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => setIndex("")}
                  aria-label="Clear Value"
                />
              ) :
              indexes.length > 0 ?
                (
                  <Combobox.Chevron />
                ) : null
          }
          rightSectionPointerEvents={index === "" ? "none" : "all"}
        >
        </TextInput>
      </Combobox.Target>
    </Combobox>
  );
});

export default SearchIndexDropdown;
