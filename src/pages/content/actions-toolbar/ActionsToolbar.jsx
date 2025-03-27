import {observer} from "mobx-react-lite";
import {useState} from "react";
import {isNotEmpty, useForm} from "@mantine/form";
import {contentStore} from "@/stores/index.js";
import {Button, Divider, Group, Modal, SegmentedControl, Text, TextInput, VisuallyHidden} from "@mantine/core";
import {FilterIcon, GridIcon, ListIcon} from "@/assets/icons/index.js";
import {IconFolder} from "@tabler/icons-react";
import styles from "@/pages/content/Content.module.css";

const ActionsToolbar = observer(({viewType, setViewType}) => {
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      displayTitle: ""
    },
    validate: {
      name: isNotEmpty("Enter a folder name")
    }
  });

  const HandleSubmit = async(values) => {
    try {
      setSaving(true);
      await contentStore.CreateContentFolder({
        // TODO: Add folder breadcrumb system
        libraryId: (contentStore.rootFolderId || "").replace("iq__", "ilib"),
        name: values.name,
        displayTitle: values.displayTitle
      });
    } finally {
      setShowFolderModal(false);
      setSaving(false);
    }
  };

  return (
    <>
      <Group gap={0} mb={12}>
        <Button variant="transparent" size="md" leftSection={<FilterIcon />} c="elv-gray.8">
          Filter
        </Button>
        <Button leftSection={<IconFolder />} size="md" onClick={() => setShowFolderModal(true)}>
          New Folder
        </Button>
        <SegmentedControl
          value={viewType}
          onChange={setViewType}
          ml="auto"
          data={[
            {
              value: "LIST",
              label: (
                <>
                  <ListIcon size={20} />
                  <VisuallyHidden>List Layout</VisuallyHidden>
                </>
              )
            },
            {
              value: "GRID",
              label: (
                <>
                  <GridIcon size={20} />
                  <VisuallyHidden>Grid Layout</VisuallyHidden>
                </>
              )
            }
          ]}
        />
      </Group>
      <Divider c="elv-gray.1" mb={24} />
      <Modal
        opened={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title={
          <Group gap={8} w="100%" wrap="nowrap">
            <IconFolder height={24} width={24} />
            <Text size="xl" fw={700} lineClamp={1}>New Folder</Text>
          </Group>
        }
        centered
      >
        <form onSubmit={form.onSubmit(HandleSubmit)}>
          <TextInput
            label="Name"
            size="lg"
            mb={16}
            placeholder="Internal name (e.g., Folder - Public Demos"
            classNames={{label: styles.inputLabel}}
            key={form.key("name")}
            {...form.getInputProps("name")}
            withAsterisk
          />
          <TextInput
            label="Display Title"
            size="lg"
            placeholder="Visible title (e.g., Public Demos)"
            classNames={{label: styles.inputLabel}}
            key={form.key("displayTitle")}
            {...form.getInputProps("displayTitle")}
          />

          <Group gap={6} justify="flex-end" mt={24}>
            <Button
              variant="white"
              size="sm"
              c="elv-gray.3"
              onClick={() => setShowFolderModal(false)}
              w={135}
            >
              <Text size="md" fw={600}>
                Cancel
              </Text>
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              loading={saving}
              w={135}
              // onClick={HandleSubmit}
            >
              <Text size="md" fw={600}>
                Create
              </Text>
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
});

export default ActionsToolbar;
