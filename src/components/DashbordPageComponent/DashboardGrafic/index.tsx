import { Box } from "@mui/material";
import { Chart } from "react-google-charts";
import { Condominium } from "../../../types/condominium.type";

type DashboardGraficProps = {
  condominium: Condominium[];
};

const DashboardGrafic: React.FC<DashboardGraficProps> = ({ condominium }) => {
  const data = [
    ["condominios", "Telas"],
    ...condominium.map((condominium) => {
      return [condominium.name, condominium.screens?.length];
    }),
  ];

  const options = {
    title: "Telas cadastradas",
    legend: { position: "bottom", alignment: "end" },
    backgroundColor: "",
    series: {
      0: { color: "#ab120e" },
    },
    hAxis: {
      title: "Telas",
    },
    vAxis: {
      title: "Condominios",
    },
    fontSize: 15,
  };

  return (
    <Box width="100%" height="100%">
      <Chart
        chartType="BarChart"
        width="100%"
        height="60vh"
        data={
          condominium.length > 0
            ? data
            : [
                ["condominios", "Telas"],
                ["", 0],
              ]
        }
        options={options}
      />
    </Box>
  );
};

export default DashboardGrafic;
