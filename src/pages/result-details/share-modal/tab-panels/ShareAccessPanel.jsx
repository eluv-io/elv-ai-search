import {Avatar, Box, Button, Checkbox, Flex, ScrollArea, Select, TagsInput, Text} from "@mantine/core";
import {useState} from "react";
import styles from "./ShareSocialPanel.module.css";

// TODO: Replace hardcoded values with api response
const EMAIL_ITEMS = [
  {email: "sd@gmail.com", initials: "SD", permission: "can download"},
  {email: "kl@gmail.com", initials: "KL", permission: "can download"},
  {email: "ds@gmail.com", initials: "DS", permission: "can stream"},
  {email: "df@gmail.com", initials: "DF", permission: "both"},
  {email: "dw@gmail.com", initials: "DW", permission: "can stream"},
  {email: "cn@gmail.com", initials: "CN", permission: "both"}
];

const ShareAccessPanel = () => {
  const [emails, setEmails] = useState([]);
  const [checkedStreaming, setCheckedStreaming] = useState(true);
  const [checkedDownload, setCheckedDownload] = useState(true);

  return (
    <Box>
      <TagsInput
        label="Share With"
        size="lg"
        placeholder={emails.length === 0 ? "Enter email addresses to add people" : ""}
        data={[]}
        value={emails}
        onChange={setEmails}
        clearable
        mb={12}
      />
      <Flex direction="row" gap={24} mb={12}>
        <Checkbox
          size="xs"
          label="Streaming URL"
          checked={checkedStreaming}
          onChange={(event) => setCheckedStreaming(event.target.checked)}
        />
        <Checkbox
          size="xs"
          label="Download URL"
          checked={checkedDownload}
          onChange={(event) => setCheckedDownload(event.target.checked)}
        />
      </Flex>
      <Box w="35%" mb={40}>
        <Button fullWidth>Save</Button>
      </Box>

      <ScrollArea h={270}>
        {
          EMAIL_ITEMS.map(item => (
            <Box key={item.email} className={styles.grid} mb={17}>
              <Avatar variant="filled" color="elv-gray.5">{ item.initials }</Avatar>
              <Text size="md" c="elv-gray.8">{ item.email }</Text>
              <Select
                data={["can stream", "can download", "both"]}
                value={item.permission}
                style={{width: "150px"}}
                size="xs"
                classNames={{input: styles.input}}
              />
            </Box>
          ))
        }
      </ScrollArea>
    </Box>
  );
};

export default ShareAccessPanel;
