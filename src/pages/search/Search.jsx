import PageContainer from "@/components/page-container/PageContainer.jsx";
import {useEffect, useState} from "react";
import {tenantStore} from "@/stores";
import {observer} from "mobx-react-lite";

const Search = observer(() => {
  const [indexes, setIndexes] = useState([]);

  useEffect(() => {
    const LoadData = async() => {
      const indexes = await tenantStore.LoadTenantIndexes();
      setIndexes(indexes);
    };

    LoadData();
  }, []);

  return (
    <PageContainer title="AI Clip Search" showSearchBar searchIndexes={indexes}>
    </PageContainer>
  );
});

export default Search;
