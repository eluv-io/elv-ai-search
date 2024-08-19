import {Box, Button, Select, Text, Textarea, Title} from "@mantine/core";
import styles from "./Create.module.css";
import {PlusIcon} from "@/assets/icons/index.js";

const CreateNavBar = () => {
  return (
    <Box bg="elv-gray.0" p="43 20 46" h="100%" maw={275}>
      <Title order={3} mb={24} classNames={{root: styles.root}}>
        Create Summary & Highlights
      </Title>

      <Text fz="xs" fw={700} c="elv-gray.9">Source</Text>
      <Select placeholer="Choose Index" mb={16} />
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
};

const Create = () => {
  return (
    <Box h="100vh">
      <CreateNavBar />
    </Box>
  );
};

export default Create;
