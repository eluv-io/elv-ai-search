import {observer} from "mobx-react-lite";
import {useState} from "react";
import {contentStore} from "@/stores/index.js";
import {Button, Divider, Group, Modal, SegmentedControl, Text, VisuallyHidden} from "@mantine/core";
import {FilterIcon, GridIcon, ListIcon} from "@/assets/icons/index.js";
import {IconFolder} from "@tabler/icons-react";
import {FilterModal, NewFolderModal} from "@/pages/content/modals/ContentModals.jsx";
import styles from "./ActionsToolbar.module.css";

const ActionsToolbar = observer(({viewType, setViewType, HandleGetResults}) => {
  const initModalData = {
    title: "",
    open: false,
    children: null,
    size: "md"
  };

  const [modalData, setModalData] = useState(initModalData);

  const CloseModal = () => setModalData({...modalData, open: false});

  return (
    <>
      <Group gap={0} mb={12}>
        <Button
          variant="transparent"
          size="md"
          leftSection={<FilterIcon />}
          c="elv-gray.8"
          onClick={() => {
            setModalData({
              open: true,
              size: "xl",
              title: "Add or Remove Filters",
              children: <FilterModal CloseModal={CloseModal} />
            });
          }}
        >
          Filter
        </Button>
        <Button
          leftSection={<IconFolder />}
          size="md"
          onClick={() => {
            setModalData({
              open: true,
              title: (
                <Group gap={8} w="100%" wrap="nowrap">
                  <IconFolder height={24} width={24} />
                  <Text size="xl" fw={700} lineClamp={1}>New Folder</Text>
                </Group>
              ),
              children: (
                <NewFolderModal
                  RefreshCallback={() => HandleGetResults()}
                  payload={{
                    libraryId: contentStore.rootFolder?.objectId,
                    groupIds: [contentStore.currentFolderId]
                  }}
                  CloseModal={CloseModal}
                />
              )
            });
          }}
        >
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
        opened={modalData.open}
        onClose={() => setModalData({...modalData, open: false})}
        title={modalData.title}
        size={modalData.size}
        classNames={{header: styles.modalHeader, body: styles.modalBody}}
        // padding="28px 40px 55px"
        centered
      >
        { modalData.children || ""}
      </Modal>
    </>
  );
});

export default ActionsToolbar;
