import {observer} from "mobx-react-lite";
import {useState} from "react";
import TextCard from "@/components/text-card/TextCard.jsx";
import {searchStore, summaryStore} from "@/stores/index.js";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title
} from "@mantine/core";
import {IconPencil, IconReload} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {CAPTION_KEYS} from "@/utils/data.js";

const CaptionEditView = observer(({
  DisableEditView,
  HandleReload
}) => {
  const [saving, setSaving] = useState(false);
  const initialValues = {};

  CAPTION_KEYS.forEach(item => {
    initialValues[item.keyName] = item.path ?
      searchStore.selectedSearchResult._caption?.[item.path]?.[item.keyName] :
      searchStore.selectedSearchResult._caption?.[item.keyName];
  });
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      ...initialValues
    }
  });

  const HandleSubmit = async(values) => {
    try {
      setSaving(true);

      await summaryStore.UpdateCaptions({
        libraryId: searchStore.selectedSearchResult.qlib_id,
        objectId: searchStore.selectedSearchResult.id,
        fileName: searchStore.selectedSearchResult._title,
        values
      });

      await summaryStore.ClearCaptionCache({
        objectId: searchStore.selectedSearchResult.id,
        fileName: searchStore.selectedSearchResult._title
      });

      DisableEditView();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Flex w="100%">
      <form onSubmit={form.onSubmit(HandleSubmit)} style={{width: "100%"}}>
        {/* 2-column layout */}
        <Group align="flex-start">
          {/* Form items */}
          <Box flex={4}>
            {
              CAPTION_KEYS
                .map(item => ({
                  ...item,
                  value: item.path ? searchStore.selectedSearchResult._caption?.[item.path]?.[item.keyName] : searchStore.selectedSearchResult._caption?.[item.keyName]}))
                .map(item => (
                  <Grid key={item.keyName} align="center" w="100%">
                    <Grid.Col span={4}>
                      <Text c="elv-gray.9" fz="sm" fw={700} lh={1.25}>{ item.name }:</Text>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      {
                        item.inputType === "textarea" ?
                          (
                            <Textarea
                              size="xs"
                              autosize
                              minRows={2}
                              maxRows={4}
                              key={item.keyName}
                              {...form.getInputProps(item.keyName)}
                            />
                          ) :
                          (
                            <TextInput
                              size="xs"
                              lh={1.25}
                              key={item.keyName}
                              {...form.getInputProps(item.keyName)}
                            />
                          )
                      }
                    </Grid.Col>
                  </Grid>
                ))
            }
          </Box>

          {/* Upper-right actions */}
          <Flex gap={6} justify="flex-end" flex={1} direction="row">
            <Group gap={0} mr={6}>
              <IconPencil color="var(--mantine-color-elv-gray-5)" height={16} />
              <Text size="xs" c="dimmed">Editing</Text>
            </Group>
            <ActionIcon
              size="sm"
              onClick={HandleReload}
              title="Re-generate"
            >
              <IconReload />
            </ActionIcon>
          </Flex>
        </Group>

        {/* Actions toolbar */}
        <Group mt={24} gap={6} justify="flex-end">
          <Button variant="outline" onClick={DisableEditView}>Cancel</Button>
          <Button type="submit" disabled={saving} loading={saving}>
            Commit
          </Button>
        </Group>
      </form>
    </Flex>
  );
});

const CaptionDisplayView = observer(({
  title,
  editEnabled,
  setEditEnabled,
  HandleReload
}) => {
  return (
    <Box>
      <Group gap={0} w="100%">
        <Title order={4} c="elv-gray.8" lh={1} truncate="end">{ title }</Title>
        <Group ml="auto" gap={6}>
          {
            editEnabled ?
              (
                <Group gap={0} mr={6}>
                  <IconPencil color="var(--mantine-color-elv-gray-5)" height={16} />
                  <Text size="xs" c="dimmed">Editing</Text>
                </Group>
              ) :
              (
                <ActionIcon
                  variant="outline"
                  size="sm"
                  onClick={() => setEditEnabled(true)}
                >
                  <IconPencil />
                </ActionIcon>
              )
          }
          <ActionIcon
            size="sm"
            onClick={HandleReload}
          >
            <IconReload />
          </ActionIcon>
        </Group>
      </Group>
      <Stack gap={0} lh={1} mt={8}>
        {
          CAPTION_KEYS.map(item => (
            {
              ...item,
              value: item.path ? searchStore.selectedSearchResult._caption?.[item.path]?.[item.keyName] : searchStore.selectedSearchResult._caption?.[item.keyName]
            })
          )
            .filter(item => !!item.value)
            .map(item => (
              <Text
                key={item.keyName}
                c="elv-gray.9"
                lh={1.25}
                fz="sm"
              >
                <span style={{fontWeight: 700, paddingRight: "8px"}}>
                  { item.name }:
                </span>
                <span>
                  { item.value }
                </span>
              </Text>
            ))
        }
      </Stack>
    </Box>
  );
});

const CaptionSection = observer(({clip}) => {
  const [loading, setLoading] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);

  const HandleReload = async() => {
    try {
      setLoading(true);
      searchStore.UpdateSelectedSearchResult({key: "_caption", value: null});

      await summaryStore.GetCaptionResults({
        objectId: clip.id,
        fileName: clip._title,
        regenerate: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      bg="elv-gray.4"
      p="16 12"
    >
      <Flex align="center" gap={16} mb={8}>
        {
          searchStore.selectedSearchResult?._caption ?
            (
              <Box w="100%">
                {
                  editEnabled ?
                    <CaptionEditView
                      DisableEditView={() => setEditEnabled(false)}
                      HandleReload={HandleReload}
                    /> :
                    <CaptionDisplayView
                      title={clip._caption?.title || clip._caption?.display_metadata?.Headline || clip._title}
                      HandleReload={HandleReload}
                      editEnabled={editEnabled}
                      setEditEnabled={setEditEnabled}
                    />
                }
              </Box>
            ) :
            (
              <Flex justify="center" mb={16} mt={12} w="100%">
                {
                  loading ? <Loader /> :
                    (
                      <Button
                        onClick={async() => {
                          try {
                            setLoading(true);

                            await summaryStore.GetCaptionResults({
                              objectId: clip.id,
                              fileName: clip._title
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Generate Caption
                      </Button>
                    )
                }
              </Flex>
            )
        }
      </Flex>
    </Paper>
  );
});

const SummarySection = observer(({clip}) => {
  const [loadingSummary, setLoadingSummary] = useState(false);

  return (
    <TextCard
      title={searchStore.selectedSearchResult?._summary ? searchStore.selectedSearchResult?._summary?.title || "Summary" : ""}
      text={searchStore.selectedSearchResult?._summary?.summary || ""}
      lineClamp={15}
      topActions={searchStore.selectedSearchResult?._summary ? [
        {
          text: "Regenerate Summary",
          onClick: async () => {
            try {
              setLoadingSummary(true);
              searchStore.UpdateSelectedSearchResult({key: "_summary", value: null});

              await summaryStore.GetSummaryResults({
                objectId: clip.id,
                startTime: clip.start_time,
                endTime: clip.end_time,
                prefix: clip.prefix,
                assetType: clip._assetType,
                cache: false
              });
            } finally {
              setLoadingSummary(false);
            }
          }
        }
      ] : []}
    >
      {
        !searchStore.selectedSearchResult?._summary &&
        (
          <Flex justify="center" mb={16} mt={12}>
            {
              loadingSummary ? <Loader /> :
                (
                  <Button
                    onClick={async() => {
                      try {
                        setLoadingSummary(true);

                        await summaryStore.GetSummaryResults({
                          objectId: clip.id,
                          startTime: clip.start_time,
                          endTime: clip.end_time,
                          prefix: clip.prefix,
                          assetType: clip._assetType,
                        });
                      } finally {
                        setLoadingSummary(false);
                      }
                    }}
                  >
                    Generate Summary
                  </Button>
                )
            }
          </Flex>
        )
      }
    </TextCard>
  );
});

const AIContentSection = observer(({clip, mediaType}) => {
  if(mediaType === "MUSIC") {
    return null;
  } else if(mediaType === "IMAGE" && searchStore.searchSummaryType === "caption") {
    return <CaptionSection clip={clip} />;
  } else {
    return <SummarySection clip={clip} />;
  }
});

export default AIContentSection;
