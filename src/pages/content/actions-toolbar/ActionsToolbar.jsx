import {observer} from "mobx-react-lite";
import {useState} from "react";
import {contentStore} from "@/stores/index.js";
import {Button, Divider, Group, Modal, SegmentedControl, Text, VisuallyHidden} from "@mantine/core";
import {FilterIcon, GridIcon, ListIcon} from "@/assets/icons/index.js";
import {IconFolder} from "@tabler/icons-react";
import {NewFolderModal} from "@/pages/content/modals/ContentModals.jsx";

const ActionsToolbar = observer(({viewType, setViewType, HandleGetResults}) => {
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const HandleSubmit = async(values) => {
    try {
      setSaving(true);
      await contentStore.CreateContentFolder({
        // TODO: Add folder breadcrumb system
        libraryId: await contentStore.client.ContentObjectLibraryId({objectId: contentStore.rootFolderId}),
        name: values.name,
        displayTitle: values.displayTitle,
        groupIds: [contentStore.rootFolderId]
      });

      await HandleGetResults();
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
        <NewFolderModal
          HandleSubmit={HandleSubmit}
          saving={saving}
          CloseModal={() => setShowFolderModal(false)}
        />
      </Modal>
    </>
  );
});

export default ActionsToolbar;
