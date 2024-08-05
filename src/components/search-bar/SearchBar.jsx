import {Flex, TextInput} from "@mantine/core";
import PaperclipIcon from "@/assets/icons/Paperclip.jsx";
import styles from "@/components/search-bar/SearchInput.module.css";
import SearchIndexDropdown from "@/pages/search/SearchIndexDropdown.jsx";

const SearchBar = ({searchIndexes}) => {
  return (
    <Flex direction="row" align="center">
      <SearchIndexDropdown indexes={searchIndexes} />

      {/* Input for search terms */}
      <TextInput
        placeholder="Search by image, video, or audio"
        leftSection={<PaperclipIcon />}
        classNames={{input: styles.input, root: styles.root}}
      />
    </Flex>
  );
};

export default SearchBar;
