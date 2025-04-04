import {observer} from "mobx-react-lite";
import {useEffect, useState} from "react";
import TextCard from "@/components/text-card/TextCard.jsx";
import {searchStore, summaryStore} from "@/stores/index.js";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Group,
  Loader, Modal,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title, Tooltip
} from "@mantine/core";
import {IconPencil, IconReload} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {CAPTION_KEYS} from "@/utils/data.js";
import styles from "./AIContentSection.module.css";

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
        prefix: searchStore.selectedSearchResult._prefix,
        values
      });

      await summaryStore.ClearCaptionCache({
        objectId: searchStore.selectedSearchResult.id,
        prefix: searchStore.selectedSearchResult._prefix
      });

      await summaryStore.UpdateCaptionApprovalState({
        objectId: searchStore.selectedSearchResult.id,
        prefix: searchStore.selectedSearchResult._prefix
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
              title="Regenerate"
            >
              <IconReload />
            </ActionIcon>
          </Flex>
        </Group>

        {/* Actions toolbar */}
        <Group mt={24} gap={6} justify="flex-end">
          <Button variant="outline" onClick={DisableEditView}>Cancel</Button>
          <Button type="submit" disabled={saving} loading={saving}>Commit</Button>
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
  const [modalData, setModalData] = useState({
    open: false,
    value: searchStore.selectedSearchResult._captionApproved
  });
  const [submitting, setSubmitting] = useState(false);
  const originalValue = searchStore.selectedSearchResult._captionApproved;

  const tooltipStyles = {
    position: "bottom",
    c: "elv-gray.8",
    color: "elv-neutral.2"
  };

  return (
    <Box>
      <Group gap={0} w="100%">
        <Flex flex="1 1 70%">
          <Title order={4} c="elv-gray.8" lh={1} lineClamp={1} w="100%">{ title }</Title>
        </Flex>
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
                <Tooltip
                  label="Edit"
                  position={tooltipStyles.position}
                  c={tooltipStyles.c}
                  color={tooltipStyles.color}
                >
                  <ActionIcon
                    variant="outline"
                    size="sm"
                    onClick={() => setEditEnabled(true)}
                  >
                    <IconPencil />
                  </ActionIcon>
                </Tooltip>
              )
          }
          <Tooltip
            label="Regenerate"
            position={tooltipStyles.position}
            c={tooltipStyles.c}
            color={tooltipStyles.color}
          >
            <ActionIcon
              size="sm"
              onClick={HandleReload}
            >
              <IconReload />
            </ActionIcon>
          </Tooltip>
          <Divider orientation="vertical" ml={3} mr={3} color="elv-gray.3" />
          <Tooltip
            label="Set approval"
            refProp="rootRef"
            position={tooltipStyles.position}
            c={tooltipStyles.c}
            color={tooltipStyles.color}
          >
            <Switch
              classNames={{track: styles.track}}
              checked={modalData.value}
              onChange={(event) => {
                setModalData({
                  open: true,
                  value: event.target.checked
                });
              }}
            />
          </Tooltip>
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
      <Modal
        opened={modalData.open}
        onClose={() => setModalData({open: false, value: originalValue})}
        title="Caption Approval"
        padding={24}
        size="lg"
        centered
      >
        <Text>
          Are you sure you would like to {modalData?.value ? "approve" : "remove approval from"} the caption? Once approved, you can still make edits and reapprove it if needed.
        </Text>
        <Group justify="flex-end" mt={16} gap={8}>
          <Button onClick={() => setModalData({open: false, value: originalValue})} variant="outline">
            Cancel
          </Button>
          <Button
            loading={submitting}
            onClick={async() => {
              try {
                setSubmitting(true);

                await summaryStore.UpdateCaptionApprovalState({
                  objectId: searchStore.selectedSearchResult.id,
                  prefix: searchStore.selectedSearchResult._prefix,
                  value: modalData.value
                });

                setModalData({
                  open: false
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </Box>
  );
});

const CaptionSection = observer(({clip, v2=false}) => {
  const [loading, setLoading] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);

  const HandleReload = async(regenerate=true) => {
    try {
      setLoading(true);
      searchStore.UpdateSelectedSearchResult({key: "_caption", value: null});

      await summaryStore.GetCaptionResults({
        objectId: clip.id,
        prefix: clip._prefix,
        regenerate,
        v2
      });

      if(regenerate) {
        setEditEnabled(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!searchStore.selectedSearchResult._caption) {
      HandleReload(false);
    }

    setEditEnabled(false);
  }, [searchStore.selectedSearchResult]);

  return (
    <Paper
      bg="elv-gray.4"
      p="16 12"
      key={searchStore.selectedSearchResult.id}
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
                      HandleReload={() => HandleReload(true)}
                    /> :
                    <CaptionDisplayView
                      title={clip._caption?.title || clip._caption?.display_metadata?.Headline || clip._title}
                      HandleReload={() => HandleReload(true)}
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
                              prefix: clip._prefix
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
  if(mediaType === "MUSIC" || !clip._tags) {
    return null;
  } else if(mediaType === "IMAGE" && searchStore.searchSummaryType.includes("caption")) {
    return <CaptionSection clip={clip} v2={searchStore.searchSummaryType === "caption2"} />;
  } else {
    return <SummarySection clip={clip} />;
  }
});

export default AIContentSection;
