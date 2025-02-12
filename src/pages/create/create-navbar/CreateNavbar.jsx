import {observer} from "mobx-react-lite";
import {useEffect, useState} from "react";
import {summaryStore, tenantStore} from "@/stores/index.js";
import {Box, Button, Loader, Select, Text, Textarea, Title} from "@mantine/core";
import styles from "@/pages/create/Create.module.css";
import {PlusIcon} from "@/assets/icons/index.js";

const CreateNavBar = observer(({
  setSummaryResults,
  isCreating,
  setIsCreating,
  setSelectedClip
}) => {
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectData, setObjectData] = useState(null);
  const [loadingObjects, setLoadingObjects] = useState(false);

  // TODO: Add fields that allow user to select these values
  const startTime = 8000;
  const endTime = 19000;

  const libraryData = Object.keys(tenantStore.libraries || {})
    .map(id => (
      {
        value: id,
        label: tenantStore.libraries[id].name
      }
    ));

  useEffect(() => {
    const LoadObjects = async () => {
      try {
        setLoadingObjects(true);

        const objects = await tenantStore.GetObjects({libraryId: selectedLibrary.value});

        const data = Object.keys(objects || {})
          .map(id => (
            {
              value: id,
              label: objects[id].name
            }
          ));

        setObjectData(data);
      } finally {
        setLoadingObjects(false);
      }
    };

    if(selectedLibrary) {
      LoadObjects();
    }
  }, [selectedLibrary]);

  const HandleSubmit = async () => {
    if(isCreating) { return; }

    try {
      setIsCreating(true);
      setSelectedClip({
        objectId: selectedObject.value,
        startTime,
        endTime
      });

      const results = await summaryStore.GetSummaryResults({
        objectId: selectedObject.value,
        startTime,
        endTime
      });

      setSummaryResults(results);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setSelectedClip(null);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box bg="elv-gray.0" p="43 20 46" h="100%" maw={275}>
      <Title order={3} mb={24} classNames={{root: styles.root}}>
        Create Summary & Highlights
      </Title>

      <Text fz="md" fw={700} c="elv-gray.9">Source</Text>
      {
        tenantStore.libraries ?
          <Select
            placeholder="Select Library"
            data={libraryData}
            value={selectedLibrary ? selectedLibrary.value : null}
            onChange={(_value, option) => setSelectedLibrary(option)}
            mb={16}
            size="xs"
          /> : <Loader size="xs" />
      }
      {
        loadingObjects ?
          <Loader /> :
          <Select
            placeholder="Select Video"
            data={objectData}
            value={selectedObject ? selectedObject.value : null}
            onChange={(_value, option) => setSelectedObject(option)}
            mb={4}
            size="xs"
          />
      }
      {/*<Button variant="transparent" p={0}>*/}
      {/*  <Text c="elv-gray.3" mb={16} fz="xs">Browse Library</Text>*/}
      {/*</Button>*/}

      <Text fz="md" fw={700} c="elv-gray.9" mb={10}>Advanced</Text>
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
      <Button
        fullWidth
        onClick={HandleSubmit}
        loading={isCreating}
      >
        Create
      </Button>
    </Box>
  );
});

export default CreateNavBar;
