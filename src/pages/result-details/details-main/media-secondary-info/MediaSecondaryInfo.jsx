import {observer} from "mobx-react-lite";
import {ActionIcon, Button, Flex, Group, Text, Tooltip} from "@mantine/core";
import {LinkIcon} from "@/assets/icons/index.js";
import {searchStore} from "@/stores/index.js";
import {TimeInterval} from "@/utils/helpers.js";
import {IconCopy} from "@tabler/icons-react";
import styles from "./MediaSecondaryInfo.module.css";
import {useClipboard} from "@mantine/hooks";
import {useEffect, useState} from "react";

const MediaSecondaryInfo = observer(() => {
  if(searchStore.selectedSearchResult._assetType) { return null; }

  const [embedUrl, setEmbedUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const clipboard = useClipboard({timeout: 2000});

  useEffect(() => {
    const LoadData = async() => {
      try {
        const {embedUrl: embed, downloadUrl: download} = await searchStore.GetShareUrls();

        setEmbedUrl(embed || "");
        setDownloadUrl(download || "");
      } catch(error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    LoadData();
  }, [searchStore.selectedSearchResult]);

  return (
    <Flex direction="row" align="center" mt={12} mb={12}>
      <Text c="elv-gray.8" mr={20} fw={400}>
        {
          TimeInterval({startTime: searchStore.selectedSearchResult.start_time, endTime: searchStore.selectedSearchResult.end_time})
        }
      </Text>
      <Group gap={3}>
        <Text c="elv-gray.8" fw={400}>{ searchStore.selectedSearchResult.id }</Text>
        <Tooltip
          label={clipboard.copied ? "Copied" : "Copy ID"}
          position="bottom"
          c="elv-gray.8"
          color="elv-neutral.2"
        >
          <ActionIcon variant="transparent" onClick={() => clipboard.copy(searchStore.selectedSearchResult.id)}>
            <IconCopy
              height={16}
              color="var(--mantine-color-elv-gray-5)"
            />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Group ml="auto">
        <Tooltip
          label={clipboard.copied ? "Copied" : "Copy URL"}
          position="bottom"
          c="elv-gray.8"
          color="elv-neutral.2"
        >
          <Button
            classNames={{root: styles.buttonRoot}}
            variant="outline"
            onClick={() => clipboard.copy(downloadUrl)}
            rightSection={<LinkIcon color="var(--mantine-color-elv-gray-9)" />}
          >
            <Text c="elv-gray.8">
              Download
            </Text>
          </Button>
        </Tooltip>

        {
          !searchStore.selectedSearchResult._assetType &&
          <Tooltip
            label={clipboard.copied ? "Copied" : "Copy URL"}
            position="bottom"
            c="elv-gray.8"
            color="elv-neutral.2"
          >
            <Button
              classNames={{root: styles.buttonRoot}}
              variant="outline"
              onClick={() => clipboard.copy(embedUrl)}
              rightSection={<LinkIcon color="var(--mantine-color-elv-gray-9)" />}
            >
              <Text c="elv-gray.8">
                Streaming
              </Text>
            </Button>
          </Tooltip>
        }
      </Group>
    </Flex>
  );
});

export default MediaSecondaryInfo;
