import {observer} from "mobx-react-lite";
import {Button, Group, RangeSlider} from "@mantine/core";
import styles from "@/pages/video-details/sidebar/tab-panels/tags-panel/TagsPanel.module.css";

const VideoDetailsSlider = observer(({sliderValues=[]}) => {
  return (
    <Group w="100%" justify="space-between" mb={20}>
      <RangeSlider
        defaultValue={[30000, 150000]}
        label={null}
        minRange={0}
        min={0}
        max={150000}
        step={30000}
        marks={sliderValues}
        w="70%"
        size={6}
        classNames={{markLabel: styles.markLabel}}
      />
      <Button size="xs">Apply</Button>
    </Group>
  );
});

export default VideoDetailsSlider;
