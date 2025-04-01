import {Button, Group, Text, TextInput, Title} from "@mantine/core";
import styles from "@/pages/content/Content.module.css";
import {isNotEmpty, useForm} from "@mantine/form";
import {useState} from "react";
import {contentStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";

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
  HandleSubmit,
  CloseModal,
  saving
}) => {
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

  return (
    <form onSubmit={form.onSubmit(HandleSubmit)}>
      <TextInput
        label="Display Title"
        size="lg"
        placeholder="Visible title (e.g., Public Demos)"
        classNames={{label: styles.inputLabel}}
        key={form.key("displayTitle")}
        {...form.getInputProps("displayTitle")}
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
      name: "",
      displayTitle: ""
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

      <FooterActions CloseModal={CloseModal} saving={saving} submitText="Create" />
    </form>
  );
});
