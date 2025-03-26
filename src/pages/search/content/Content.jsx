import {observer} from "mobx-react-lite";
import {Box} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore} from "@/stores/index.js";
import ContentList from "@/pages/search/content/ContentList.jsx";

const Content = observer(({show}) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        const contentMetadata = await contentStore.GetContentData({
          filterByFolder: false
        });
        setContent(contentMetadata);
      } finally {
        setLoading(false);
      }
    };

    LoadData();
  }, []);

  if(!show) { return null; }

  return (
    <Box>
      <ContentList
        records={content}
        loading={loading}
      />
    </Box>
  );
});

export default Content;
