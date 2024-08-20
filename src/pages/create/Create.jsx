import {Box, Button, Flex, Loader, Select, Text, Textarea, Title} from "@mantine/core";
import styles from "./Create.module.css";
import {PlusIcon} from "@/assets/icons/index.js";
import {observer} from "mobx-react-lite";
import {tenantStore} from "@/stores/index.js";
import {useEffect, useState} from "react";
import CreateVideoMain from "@/pages/create/video-container/CreateVideoMain.jsx";
import {useDisclosure} from "@mantine/hooks";
import CreateSidebar from "@/pages/create/create-sidebar/CreateSidebar.jsx";

const CreateNavBar = observer(() => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const indexData = Object.keys(tenantStore.searchIndexes || {})
    .map(id => (
      {
        value: id,
        label: tenantStore.searchIndexes[id].name
      }
    ));

  useEffect(() => {
    if(!tenantStore.searchIndexes) {
      tenantStore.GetTenantIndexes();
    }
  }, [tenantStore.searchIndexes]);

  return (
    <Box bg="elv-gray.0" p="43 20 46" h="100%" maw={275}>
      <Title order={3} mb={24} classNames={{root: styles.root}}>
        Create Summary & Highlights
      </Title>

      <Text fz="xs" fw={700} c="elv-gray.9">Source</Text>
      {
        tenantStore.loadedIndexes ?
          <Select
            placeholder="Choose Index"
            data={indexData}
            value={selectedIndex ? selectedIndex.value : null}
            onChange={(_value, option) => setSelectedIndex(option)}
            mb={16}
          /> : <Loader />
      }
      <Select placeholder="Source Video" mb={4} />
      <Button variant="transparent" p={0}>
        <Text c="elv-gray.3" mb={16} fz="xs">Browse Library</Text>
      </Button>

      <Text fz="xs" fw={700} c="elv-gray.9" mb={10}>Advanced</Text>
      <Textarea placeholder="Create a summary for this video" mb={16} />
      <Textarea placeholder="Highlights" mb={16} />

      <Button
        variant="transparent"
        mb={50}
        rightSection={<PlusIcon />}
        p={0}
        classNames={{label: styles.buttonLabel}}
      >
        Add Tags To Prompt
      </Button>
      <Button fullWidth>Create</Button>
    </Box>
  );
});

const Create = observer(() => {
  const [openedSidebar, {open, close}] = useDisclosure(true);

  return (
    <Box h="100vh">
      <Flex justify="space-between" direction="row" h="100%">
        <CreateNavBar />
        <CreateVideoMain openedSidebar={openedSidebar} open={open} />
        <CreateSidebar opened={openedSidebar} close={close} />
      </Flex>
    </Box>
  );
});

export default Create;
