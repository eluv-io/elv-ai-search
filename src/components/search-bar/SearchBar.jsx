import {ActionIcon, Flex, Loader, TextInput} from "@mantine/core";
import styles from "@/components/search-bar/SearchInput.module.css";
import SearchIndexDropdown from "@/pages/search/SearchIndexDropdown.jsx";
import {useEffect, useState} from "react";
import {tenantStore} from "@/stores/index.js";
import {SubmitIcon, PaperClipIcon} from "@/assets/icons";

const SearchBar = () => {
  const [indexes, setIndexes] = useState([]);
  const [loadingIndexes, setLoadingIndexes] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const LoadData = async() => {
      const indexes = await tenantStore.GetTenantIndexes();
      setIndexes(indexes);
      setLoadingIndexes(false);
    };

    LoadData();
  }, []);

  if(loadingIndexes) { return <Loader />; }

  const HandleSearch = () => {
    if(!(searchValue || selectedIndex)) { return; }
  };

  return (
    <Flex direction="row" align="center" mb={24}>
      <SearchIndexDropdown
        indexes={indexes}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />

      {/* Input for search terms */}
      <TextInput
        placeholder="Search by image, video, or audio"
        value={searchValue}
        onChange={event => setSearchValue(event.target.value)}
        leftSection={<PaperClipIcon />}
        classNames={{input: styles.input, root: styles.root}}
        rightSection={
        <ActionIcon
          aria-label="Submit search"
          variant="transparent"
          component="button"
          onClick={HandleSearch}
        >
          <SubmitIcon />
        </ActionIcon>
      }
        rightSectionPointerEvents="all"
      />
    </Flex>
  );
};

export default SearchBar;
