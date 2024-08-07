import {Box, Title} from "@mantine/core";
import styles from "@/components/page-container/PageContainer.module.css";

const PageContainer = ({title, children}) => {
  return (
    <Box p="24 46">
      <Title order={3} classNames={{root: styles.root}} mb={24}>
        { title }
      </Title>
      { children }
    </Box>
  );
};

export default PageContainer;
