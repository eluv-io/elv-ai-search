import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Avatar,
  Box, Button,
  CopyButton,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Tooltip
} from "@mantine/core";
import {LinkIcon, LockIcon, PencilIcon} from "@/assets/icons/index.js";
import {useEffect, useState} from "react";
import styles from "./ShareSection.module.css";
import {IconChevronDown} from "@tabler/icons-react";
import {searchStore} from "@/stores/index.js";
import {useClipboard} from "@mantine/hooks";

const ShareRow = observer(({
  avatar,
  title,
  subtitle,
  textTertiary,
  permission
}) => {
  const [permissionField, setPermissionField] = useState(permission);
  const [width, setWidth] = useState("auto");
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  useEffect(() => {
    const stringLength = permissionField?.length;

    setWidth(stringLength ? `${stringLength + 3}ch` : `${30}px`);
    setDropdownWidth("16ch");
  }, [permissionField]);

  return (
    <Group mb={8} align="flex-start">
      <Group gap={20} align="flex-start">
        <Avatar color="elv-neutral.4" bg="elv-gray.2" size={36}>
          { avatar }
        </Avatar>
        <Stack gap={4}>
          <Text fw={500} c="elv-gray.8" lh={1}>{ title }</Text>
          <Text fw={400} c="elv-neutral.5" fz={12} lh={1}>{ subtitle }</Text>
          { textTertiary ? textTertiary : null }
        </Stack>
      </Group>
      <Box ml="auto" align="flex-start">
        <Select
          align="flex-start"
          classNames={{
            input: styles.dropdownInput,
            section: styles.dropdownSection,
            dropdown: styles.dropdown
        }}
          value={permissionField}
          onChange={value => setPermissionField(value)}
          styles={{
            input: {width},
            dropdown: {minWidth: dropdownWidth}
          }}
          rightSection={<IconChevronDown width={15} color="var(--mantine-color-elv-gray-8)" />}
          comboboxProps={{width: dropdownWidth}}
          data={[
            {value: "download", label: "Download"},
            {value: "stream", label: "Stream"},
            {value: "stream-download", label: "Stream & Download"}
          ]}
        />
      </Box>
    </Group>
  );
});

const ShareSection = observer(() => {
  const [embedUrl, setEmbedUrl] = useState("");
  // const [downloadUrl, setDownloadUrl] = useState("");
  const clipboard = useClipboard({timeout: 2000});

  useEffect(() => {
    const LoadData = async () => {
      const {embedUrl} = await searchStore.GetShareUrls();

      setEmbedUrl(embedUrl || "");
      // setDownloadUrl(downloadUrl || "");
    };

    LoadData();
  }, []);

  const shareData = [
    {email: "michelle.munson@eluv.io", permission: "download"},
    {email: "serban.simu@eluv.io", permission: "stream"},
    {email: "gerald.hernandez@eluv.io", permission: "stream-download", expiration: 1743702609623}
  ];

  return (
    <Box>
      <Text fz={20} fw={700} c="elv-gray.8" mb={16}>People with Access</Text>
      {
        shareData ?
        shareData.map(item => (
          <ShareRow
            key={item.email}
            title={item.email}
            subtitle={item.email}
            permission={item.permission}
            avatar={item.email.slice(0, 1)}
            textTertiary={
            item.expiration ?
              <Group gap={12}>
                <Text fw={400} c="elv-neutral.5" fz={12} lh={1} mt={4}>
                  Access expires {
                    new Date(item.expiration).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })
                  }
                </Text>
                <ActionIcon variant="transparent" size="sm">
                  <PencilIcon height={20} width={20} color="var(--mantine-color-elv-neutral-5)" />
                </ActionIcon>
              </Group> : null
            }
          />
        )) : "No permissions have been set up yet."
      }
      <Divider color="elv-gray.3" mb={16} mt={12} />
      <Text fz={20} fw={700} c="elv-gray.8" mb={16}>General Access</Text>
      <ShareRow
        title="Restricted"
        subtitle="Only people with access"
        permission="stream"
        avatar={<LockIcon />}
      />

      <Tooltip
        label={clipboard.copied ? "Copied" : "Copy URL"}
        position="bottom"
        c="elv-gray.8"
        color="elv-neutral.2"
      >
        <Button
          size="xs"
          classNames={{root: styles.pillButton}}
          variant="outline"
          mt={8}
          ml={36 + 20}
          onClick={() => clipboard.copy(embedUrl)}
          leftSection={<LinkIcon color="var(--mantine-color-elv-gray-8)" />}
        >
          <Text c="elv-gray.8" fz={12} fw={500}>
            Copy Streaming URL
          </Text>
        </Button>
      </Tooltip>
    </Box>
  );
});

export default ShareSection;
