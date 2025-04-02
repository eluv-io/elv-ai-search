import {createTheme, rem} from "@mantine/core";

const theme = createTheme({
  fontFamily: "Inter, Helvetica Neue, helvetica, sans-serif",
  headings: {
    fontFamily: "Inter, Helvetica Neue, helvetica, sans-serif",
    sizes: {
      h1: {
        fontSize: rem(22),
        fontWeight: 600
      },
      h2: {
        fontSize: rem(18),
        fontWeight: 600,
      },
      h3: {
        fontSize: rem(14),
        fontWeight: 700
      },
      h4: {
        fontSize: rem(14),
        fontWeight: 500
      },
      h6: {
        fontSize: rem(12),
        fontWeight: 500
      }
    }
  },
  fontSizes: {
    sm: rem(12),
    md: rem(16),
    xl: rem(24)
  },
  primaryColor: "elv-violet",
  primaryShade: 3,
  scale: 1,
  colors: {
    "elv-violet": [
      "#f9e9ff",
      "#ebcfff",
      "#bd6dff", // eluvio color
      "#b964ff", // eluvio color
      "#a437fe",
      "#971afe",
      "#9009ff",
      "#7c00e4",
      "#8f5aff", // eluvio color
      "#5f00b3",
      "#380c61", // eluvio color
    ],
    "elv-blue-violet": [
      "#eaeaff",
      "#d0d0ff",
      "#9e9efe",
      "#6a6afb", // eluvio color
      "#3c3bf9",
      "#201ff8",
      "#1010f9",
      "#0105de",
      "#0002c7",
      "#0000b0"
    ],
    "elv-gray": [
      "#f5f5f5",
      "#e3e3e3", // eluvio color
      "#d7d7d7", // eluvio color
      "#bdbdbd", // eluvio color
      "rgba(0, 0, 0, 0.06)", // eluvio color
      "#8b8b8b",
      "#868e96", // eluvio color
      "#6b6b6b", // eluvio color
      "#4b494e", // eluvio color
      "#3c3c3c" // eluvio color
    ],

    "elv-black": [
      "#22252a", // eluvio color
      "#202020", // eluvio color
      "#1e1e1e", // eluvio color
      "#212529" // eluvio color
    ],
    "elv-neutral": [
      "#f8f2fe",
      "#ecece8", // eluvio color
      "#cdc8d3",
      "#b2aaba", // eluvio color
      "#a9a0b2", // eluvio color
      "#7b7580", // eluvio color
      "#847791",
      "#71667e",
      "#665972",
      "#594c66"
    ],
    "elv-red": [
      "#ffe9e6",
      "#ffd3cd",
      "#ffa69b",
      "#ff7663",
      "#e85e60", // eluvio color
      "#ff3418",
      "#ff2507",
      "#e41600",
      "#cc0e00",
      "#b20000"
    ],
    "elv-green": [
      "#ebfaed",
      "#ddf0df",
      "#bdddbf",
      "#9ac99d",
      "#7cb980",
      "#69af6d",
      "#58a65d", // eluvio color
      "#4d9552",
      "#428447",
      "#34733a"
    ]
  },
  components: {
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
    Badge: {
      styles: () => ({
        root: {
          "--badge-height-lg": "calc(37.5px* var(--mantine-scale))"
        }
      })
    },
    Dropzone: {
      styles: () => ({
        root: {
          border: "none",
          borderRadius: "5px",
          backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%23380c61' stroke-width='2' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")"
        }
      })
    },
    InputWrapper: {
      styles: () => ({
        label: {
          "fontWeight": 600,
          "fontSize": rem(16),
          "color": "var(--mantine-color-elv-gray-8)",
          "marginBottom": "2px"
        }
      })
    },
    Modal: {
      styles: () => ({
        root: {
          "--modal-size-xxl": rem(950)
        },
        title: {
          "fontSize": rem(22),
          "fontWeight": 600,
          "color": "var(--mantine-color-elv-gray-9)"
        }
      })
    },
    Switch: {
      styles: () => ({
        root: {
          "--switch-height-xxl": "calc(3.125rem*var(--mantine-scale))",
          "--switch-width-xxl": "calc(5.875rem*var(--mantine-scale))",
          "--switch-thumb-size-xxl": "calc(2.5rem* var(--mantine-scale))",
          "--switch-label-font-size-xxl": "calc(0.75rem* var(--mantine-scale))",
          "--switch-track-label-padding-xxl": "calc(0.25rem* var(--mantine-scale))"
        }
      })
    },
    Radio: {
      styles: () => ({
        body: {
          alignItems: "flex-start"
        }
      })
    },
    Table: {
      vars: (theme, props) => {
        if(props.size === "xxs") {
          return {
            root: {
              "--text-fz": rem(12)
            }
          };
        }
      }
    },
    Tabs: {
      styles: () => ({
        list: {
          "--tabs-list-border-size": "1px"
        }
      })
    },
    Text: {
      styles: () => ({
        root: {
          "--mantine-font-size-xxs": "calc(0.675rem* var(--mantine-scale))"
        }
      })
    }
  }
});

export default theme;
