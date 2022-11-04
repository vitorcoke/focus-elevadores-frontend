import { Box } from "@mui/material";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import DashboardGrafic from "../components/DashbordPageComponent/DashboardGrafic";
import { withAllPermission } from "../hocs";
import AppBarLayoutPage from "../layout/AppBar";
import BaseMainLayoutPage from "../layout/BaseMain";
import { getAPIClient } from "../service";
import { Condominium } from "../types/condominium.type";

type DashboardProps = {
  initialCondominium: Condominium[];
};

const Deshboard: React.FC<DashboardProps> = ({ initialCondominium }) => {
  const [condominium, setCondominium] = useState(initialCondominium);

  return (
    <AppBarLayoutPage>
      <BaseMainLayoutPage page="dashboard" title="Gráfico">
        <Box width="100%" height="60vh">
          <DashboardGrafic condominium={condominium} />
        </Box>
      </BaseMainLayoutPage>
    </AppBarLayoutPage>
  );
};

export default withAllPermission(Deshboard);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<Condominium[]>("/condominium?query=all");

    return {
      props: {
        initialCondominium: data,
      },
    };
  } catch {
    return {
      props: {
        initialCondominium: [],
      },
    };
  }
};
