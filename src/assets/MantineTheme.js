import {createTheme} from "@mantine/core";

const theme = createTheme({
  fontFamily: "Helvetica Neue, Helvetica, sans-serif",
  headings: {
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
  },
  primaryColor: "elv-violet",
  primaryShade: 3,
  colors: {
    "elv-violet": [
      "#f9e9ff",
      "#ebcfff",
      "#d29cff",
      "#b964ff", // eluvio color
      "#a437fe",
      "#971afe",
      "#9009ff",
      "#7c00e4",
      "#8f5aff", // eluvio color
      "#5f00b3",
      "#380c61", // eluvio color
    ],
    "elv-gray": [
      "#f5f5f5",
      "#f0f0f0",
      "#cdcdcd",
      "#bdbdbd", // eluvio color
      "rgba(0,0,0,0.06)", // eluvio color
      "#8b8b8b",
      "#848484",
      "#717171",
      "#4b494e", // eluvio color
      "#3c3c3c" // eluvio color
    ],
    "elv-neutral": [
      "#f8f2fe",
      "#e8e4ed",
      "#cdc8d3",
      "#b2aaba", // eluvio color
      "#a9a0b2", // eluvio color
      "#7b7580", // eluvio color
      "#847791",
      "#71667e",
      "#665972",
      "#594c66"
    ]
  },
  components: {
    Tabs: {
      styles: () => ({
        list: {
          "--tabs-list-border-size": "1px"
        }
      })
    },
    Accordion: {
      styles: () => ({
        control: {
          backgroundColor: "var(--mantine-color-elv-gray-4)"
        },
        label: {
          lineHeight: 1,
          paddingTop: "var(--mantine-spacing-xs)",
          paddingBottom: "var(--mantine-spacing-xs)",
          fontWeight: 600,
          color: "var(--mantine-color-elv-gray-8)"
        },
        item: {
          "--item-border-color": "transparent"
        },
        panel: {
          color: "var(--mantine-color-elv-gray-8)"
        },
        content: {
          padding: 0
        }
      })
    },
    Table: {
      vars: (theme, props) => {
        if(props.size === "xxs") {
          return {
            root: {
              "--text-fz": "0.75rem"
            }
          };
        }
      }
    }
  }
});

export default theme;
