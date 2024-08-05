import {Combobox, Flex, Input} from "@mantine/core";

const SearchBar = () => {
  return (
    <Flex>
      <Combobox>
        {/* Search index options */}
        <Combobox.Dropdown>
          <Combobox.Options></Combobox.Options>
        </Combobox.Dropdown>

        {/* Input for search terms */}
        <Combobox.Target>
          <Input placeholder="Search by image, video, or audio"></Input>
        </Combobox.Target>
      </Combobox>
    </Flex>
  );
};

export default SearchBar;
