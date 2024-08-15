import {observer} from "mobx-react-lite";
import {Badge as MantineBadge} from "@mantine/core";
import styles from "./Badge.module.css";

const Badge = observer(({label, color}) => {
  return (
    <MantineBadge
      variant="dot"
      color={color}
      classNames={{label: styles.label, root: styles.root}}
      size="lg"
    >
      { label }
    </MantineBadge>
  );
});

export default Badge;
