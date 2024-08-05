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
      "#eee",
      "#cdcdcd",
      "#b2b2b2",
      "#9a9a9a",
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
      "#8b7f97",
      "#847791",
      "#71667e",
      "#665972",
      "#594c66"
    ]
  }
});

export default theme;
