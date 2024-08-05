import {Box, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";
import SearchBar from "@/components/search-bar/SearchBar.jsx";

const PageContainer = ({title, showSearchBar=false, searchIndexes, children}) => {
  return (
    <Box p="24 46">
      <Title order={3} classNames={{root: styles.root}} mb={24}>
        { title }
      </Title>
      {
        showSearchBar &&
        <SearchBar searchIndexes={searchIndexes} />
      }
      { children }
    </Box>
  );
};

export default PageContainer;
