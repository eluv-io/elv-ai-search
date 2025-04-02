import {Box, Button, Group, List, Select, SimpleGrid, Text, TextInput, Title} from "@mantine/core";
import {isNotEmpty, useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {contentStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";
import {DataTable} from "mantine-datatable";
import {IconClock, IconFolder} from "@tabler/icons-react";
import styles from "./ContentModals.module.css";
import {MEDIA_TYPES} from "@/utils/constants.js";
import {DatePickerInput} from "@mantine/dates";
import {CalendarIcon} from "@/assets/icons/index.js";

export const ModalTitle = ({Icon, title}) => {
  return (
    <Group gap={8} w="100%" wrap="nowrap">
      {
        Icon ?
        <Icon height={22} width={22} className={styles.shareIcon} /> : null
      }
      <Title order={1} lineClamp={1}>{ title }</Title>
    </Group>
  );
};

const FooterActions = ({
  CloseModal,
  saving,
  submitText="Submit"
}) => {
  return (
    <Group gap={6} justify="flex-end" mt={24}>
      <Button
        variant="white"
        size="sm"
        c="elv-gray.3"
        onClick={CloseModal}
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
      >
        <Text size="md" fw={600}>
          { submitText }
        </Text>
      </Button>
    </Group>
  );
};

export const DuplicateModal = () => {};

export const RenameModal = ({
  objectId,
  defaultValue,
  CloseModal,
  RefreshCallback
}) => {
  const [saving, setSaving] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: defaultValue
    },
    validate: {
      name: isNotEmpty("Enter a folder name")
    }
  });

  const HandleSubmit = async(values) => {
    try {
      setSaving(true);

      await contentStore.UpdateContentName({
        objectId,
        values: values.name
      });

      await RefreshCallback();
    } finally {
      setSaving(false);
      CloseModal();
    }
  };

  return (
    <form onSubmit={form.onSubmit(HandleSubmit)}>
      <TextInput
        label="Name"
        size="lg"
        placeholder="Untitled folder"
        classNames={{label: styles.inputLabel}}
        key={form.key("name")}
        {...form.getInputProps("name")}
      />

      <FooterActions CloseModal={CloseModal} saving={saving} submitText="Rename" />
    </form>
  );
};

export const NewFolderModal = observer(({
  payload={}, // libraryId: string, groupIds: []
  CloseModal,
  RefreshCallback
}) => {
  const [saving, setSaving] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: ""
    },
    validate: {
      name: isNotEmpty("Enter a folder name")
    }
  });

  const {libraryId, groupIds} = payload;

  const HandleSubmit = async(values) => {
    try {
      setSaving(true);
      await contentStore.CreateContentFolder({
        libraryId,
        name: values.name,
        displayTitle: values.displayTitle,
        groupIds
      });

      await RefreshCallback();
    } finally {
      CloseModal();
      setSaving(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(HandleSubmit)}>
      <TextInput
        label="Name"
        size="lg"
        mb={16}
        placeholder="Untitled folder"
        classNames={{label: styles.inputLabel}}
        key={form.key("name")}
        {...form.getInputProps("name")}
        withAsterisk
      />
      <FooterActions CloseModal={CloseModal} saving={saving} submitText="Create" />
    </form>
  );
});

export const OrganizeModal = observer(({CloseModal}) => {
  const [folderContent, setFolderContent] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const HandleGetFolders = async() => {
      try {
        const folderMetadata = await contentStore.GetContentData({
          filterOptions: {
            types: ["folder"],
            group: contentStore.rootFolder?.objectId
          }
        });

        setFolderContent(folderMetadata.content);
      } catch(error) {
        console.error(error);
      }
    };
    HandleGetFolders();
  }, []);

  return (
    <>
      {
        folderContent.length > 0 ?
          (
            <DataTable
              records={folderContent}
              columns={[
                {
                  accessor: "type",
                  title: "Type",
                  render: () => <IconFolder />
                }
              ]}
            />
          ) : "No folders found"
      }
      <FooterActions CloseModal={CloseModal} saving={saving} submitText="Move" />
    </>
  );
});

export const DeleteModal = observer(({CloseModal, titles=[]}) => {
  const [saving, setSaving] = useState(false);

  return (
    <Box w="100%">
      <Text c="elv-gray.8" fz={14} fw={400}>Are you sure you want to delete these files? This action is permanent and cannot be undone. Please confirm to proceed.</Text>
      <List withPadding w="100%">
        {
          titles.map((title, i) => (
            <List.Item key={`${title}-${i}`} maw="100%">
              <Text c="elv-gray.8" fz={14} fw={400} lineClamp={5} className={styles.listItem} w="90%">
                { title }
              </Text>
            </List.Item>
          ))
        }
      </List>
      <FooterActions CloseModal={CloseModal} saving={saving} submitText="Delete" />
    </Box>
  );
});

export const FilterModal = () => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      type: "video",
      access: "public",
      dateRange: [],
      tags: "",
      duration: ""
    }
  });

  const HandleSubmit = (values) => {
    console.log('values', values)
  };

  const inputSize = "lg";

  return (
    <Box>
      <Group mb={12}>
        <Button onClick={HandleSubmit} ml="auto">
          <Text fw={600} fz={14} tt="uppercase">
            Apply
          </Text>
        </Button>
      </Group>
      <Box>
        <form onSubmit={form.onSubmit(HandleSubmit)}>
          <SimpleGrid spacing={20} cols={2}>
            <Select
              label="Primary Type"
              size={inputSize}
              data={Object.keys(MEDIA_TYPES).map(type => (
                {label: MEDIA_TYPES[type].label, value: type}
              ))}
              key="type"
              {...form.getInputProps("type")}
            />
            <Select
              label="Access"
              size={inputSize}
              data={[
                {label: "Public", value: "public"}
              ]}
              key="access"
              {...form.getInputProps("access")}
            />
            <DatePickerInput
              type="range"
              size={inputSize}
              label="Date Range"
              placeholder="Select a range"
              rightSection={<CalendarIcon />}
              maxDate={new Date()}
              key="dateRange"
              {...form.getInputProps("dateRange")}
            />
            <TextInput
              label="Tags"
              placeholder="Enter tags, separated by commas"
              size={inputSize}
              key="tags"
              {...form.getInputProps("tags")}
            />
            <TextInput
              label="Duration"
              placeholder="Select a range"
              size={inputSize}
              rightSection={<IconClock />}
              key="duration"
              {...form.getInputProps("duration")}
            />
          </SimpleGrid>
        </form>
      </Box>
    </Box>
  );
};
