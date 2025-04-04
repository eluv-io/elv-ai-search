import {observer} from "mobx-react-lite";
import {ActionIcon, Button, Flex, Group, Text, Tooltip} from "@mantine/core";
import {ClipEditingIcon, LinkIcon} from "@/assets/icons/index.js";
import {searchStore} from "@/stores/index.js";
import {FormatTime, TimeInterval} from "@/utils/helpers.js";
import {IconCopy} from "@tabler/icons-react";
import styles from "./MediaSecondaryInfo.module.css";
import {useClipboard} from "@mantine/hooks";

const PlayClipButton = observer(({playFullVideo, setPlayFullVideo}) => {
  if(!searchStore.selectedSearchResult._clipType) { return null; }

  return (
    <Button
      leftSection={<ClipEditingIcon />}
      miw={200}
      mr={12}
      onClick={() => setPlayFullVideo(prev => !prev)}
    >
      <Text fw={600} fz={14}>
        { playFullVideo ? "Play Clip" : "Play Full Clip" }
      </Text>
    </Button>
  );
});

const MediaSecondaryInfo = observer(({downloadUrl, embedUrl, playFullVideo, setPlayFullVideo}) => {
  if(searchStore.selectedSearchResult._assetType) { return null; }

  const clipboard = useClipboard({timeout: 2000});

  return (
    <Flex direction="row" align="center" mt={12} mb={12}>
      <PlayClipButton playFullVideo={playFullVideo} setPlayFullVideo={setPlayFullVideo} />
      <Text c="elv-gray.8" mr={20} fw={400}>
        {
          (searchStore.selectedSearchResult.start_time || searchStore.selectedSearchResult.end_time) ?
          TimeInterval({startTime: searchStore.selectedSearchResult.start_time, endTime: searchStore.selectedSearchResult.end_time}) :
            FormatTime({
              time: searchStore.selectedSearchResult._duration,
              millisecondsFormat: false,
              hideHour: true
            })
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
