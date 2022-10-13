import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { Avatar, Box } from "@mui/material";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../service";
import { Banner } from "../../types/banner.type";
import { useState } from "react";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import AddBannerDialog from "../../components/BannerPageComponent/AddBannerDialog";
import EditBannerDialog from "../../components/BannerPageComponent/EditBannerDialog";

type BannerProps = {
  initialBanner: Banner[];
};

const Banner: React.FC<BannerProps> = ({ initialBanner }) => {
  const { checkboxBanner, setCheckboxBanner } =
    useControlerButtonPagesContext();

  const [banner, setBanner] = useState(initialBanner);
  const [editBanner, setEditBanner] = useState<Banner>();

  const column: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Nome", flex: 2 },
    {
      field: "image",
      headerName: "Imagem",
      renderCell: (params) => {
        return <Avatar src={params.row.image} sx={{ width: 50, height: 50 }} />;
      },
      flex: 2,
    },
  ];

  const rows = banner.map((banner) => {
    return {
      id: banner._id,
      _id: banner._id,
      name: banner.name,
      description: banner.description,
      image: banner.image,
      background_color: banner.background_color,
      font_color: banner.font_color,
    };
  });

  return (
    <LayoutPage>
      <BaseMainLayoutPage page="banner" title="Banner" setBanner={setBanner}>
        <Box width="100%" height="60vh">
          <DataGridPro
            rows={rows}
            columns={column}
            checkboxSelection
            onSelectionModelChange={(e) => setCheckboxBanner(e)}
            selectionModel={checkboxBanner}
            onCellClick={(params) =>
              checkboxBanner.length === 0
                ? setEditBanner(params.row as Banner)
                : setEditBanner(undefined)
            }
          />
          <AddBannerDialog setBanner={setBanner} />
          {editBanner && (
            <EditBannerDialog banner={editBanner} setBanner={setBanner} />
          )}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default Banner;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<Banner[]>("/banner");

    return {
      props: { initialBanner: data },
    };
  } catch {
    return {
      props: { initialBanner: [] },
    };
  }
};
