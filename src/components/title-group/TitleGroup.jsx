import {Group, Loader, Text} from "@mantine/core";
import AiIcon from "@/components/ai-icon/AiIcon.jsx";

const TitleGroup = ({
  title,
  aiGenerated=false,
  loading,
  ...props
}) => {
  return (
    <Group gap={4} mb={12} {...props}>
      {
        aiGenerated &&
        <AiIcon />
      }
      <Group>
        <Text fz={16} fw={600} c="elv-gray.8">{ title }</Text>
        {
          loading &&
          <Loader size="xs" />
        }
      </Group>
    </Group>
  );
};

export default TitleGroup;
