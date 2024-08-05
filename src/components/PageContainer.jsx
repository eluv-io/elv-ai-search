import {Box, Title} from "@mantine/core";
import styles from "@/assets/modules/PageContainer.module.css";
import SearchBar from "@/components/SearchBar.jsx";

const PageContainer = ({title, showSearchBar=false, children}) => {
  return (
    <Box p="24 46">
      <Title order={3} classNames={{root: styles.root}} mb={24}>
        { title }
      </Title>
      {
        showSearchBar &&
        <SearchBar />
      }
      { children }
    </Box>
  );
};

export default PageContainer;
