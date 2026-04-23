import { GetServerSideProps } from "next";
import { useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import {
  ApartmentRounded,
  CommentRounded,
  InsightsRounded,
  PersonAddAlt1Rounded,
  TrendingUpRounded,
  VideocamRounded,
} from "@mui/icons-material";
import { SurfaceCard } from "../components/design-system";
import { withAllPermission } from "../hocs";
import AppBarLayoutPage from "../layout/AppBar";
import { getAPIClient } from "../service";
import { CondominiumType } from "../types/condominium.type";

type DashboardProps = {
  initialCondominium: CondominiumType[];
};

type StatCard = {
  label: string;
  value: string | number;
  change: string;
  gradient: string;
  Icon: typeof ApartmentRounded;
};

const Dashboard: React.FC<DashboardProps> = ({ initialCondominium }) => {
  const [condominium] = useState(initialCondominium);

  const totalScreens = useMemo(
    () => condominium.reduce((acc, item) => acc + (item.screens?.length || 0), 0),
    [condominium]
  );

  const chartData = useMemo(
    () => [
      ["Condominio", "Telas"],
      ...(condominium.length
        ? condominium.map((item) => [item.name, item.screens?.length || 0])
        : [["Sem dados", 0]]),
    ],
    [condominium]
  );

  const stats = useMemo<StatCard[]>(
    () => [
      {
        label: "Condominios",
        value: condominium.length,
        Icon: ApartmentRounded,
        gradient: "var(--gradient-primary)",
        change: `${condominium.length} bases cadastradas`,
      },
      {
        label: "Telas Ativas",
        value: totalScreens,
        Icon: VideocamRounded,
        gradient: "var(--gradient-accent)",
        change: `${totalScreens} telas vinculadas`,
      },
      {
        label: "Mensagens",
        value: condominium.filter((item) => (item.screens?.length || 0) > 0).length,
        Icon: CommentRounded,
        gradient: "linear-gradient(135deg, #ff8a5b 0%, #ff5d77 100%)",
        change: "Condominios com telas ativas",
      },
      {
        label: "Media por Base",
        value: condominium.length ? (totalScreens / condominium.length).toFixed(1) : "0.0",
        Icon: PersonAddAlt1Rounded,
        gradient: "var(--gradient-success)",
        change: "Telas por condominio",
      },
    ],
    [condominium, totalScreens]
  );

  return (
    <AppBarLayoutPage>
      <div className="dashboard-shell" style={{ color: "#eef2ff" }}>
        <div className="dashboard-header">
          <h1 style={{ color: "#eef2ff" }}>Dashboard</h1>
          <p style={{ color: "rgba(238, 242, 255, 0.58)" }}>Visao geral do sistema</p>
        </div>

        <div className="dashboard-stats-grid">
          {stats.map((stat) => (
            <SurfaceCard key={stat.label} className="dashboard-stat-card">
              <div className="dashboard-stat-card__glow" style={{ background: stat.gradient }} />
              <div className="dashboard-stat-card__content">
                <div>
                  <p className="dashboard-stat-card__label">{stat.label}</p>
                  <strong className="dashboard-stat-card__value">{stat.value}</strong>
                  <span className="dashboard-stat-card__change">
                    <TrendingUpRounded fontSize="inherit" />
                    {stat.change}
                  </span>
                </div>
                <div className="dashboard-stat-card__icon" style={{ background: stat.gradient }}>
                  <stat.Icon fontSize="small" />
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <SurfaceCard className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <div>
              <h2>Telas por Condominio</h2>
              <p>Distribuicao de telas ativas</p>
            </div>
            <div className="dashboard-chart-card__badge">
              <InsightsRounded fontSize="small" />
            </div>
          </div>
          <div className="dashboard-chart-card__body">
            <Chart
              chartType="BarChart"
              width="100%"
              height="350px"
              data={chartData}
              options={{
                backgroundColor: "transparent",
                chartArea: { left: 120, right: 24, top: 18, bottom: 40 },
                legend: { position: "none" },
                colors: ["#7b68ff"],
                bar: { groupWidth: "56%" },
                hAxis: {
                  minValue: 0,
                  textStyle: { color: "#8a93b8", fontSize: 12 },
                  gridlines: { color: "#20263b" },
                  baselineColor: "#20263b",
                },
                vAxis: {
                  textStyle: { color: "#8a93b8", fontSize: 13 },
                  gridlines: { color: "transparent" },
                  baselineColor: "transparent",
                },
                tooltip: {
                  textStyle: { color: "#eef2ff" },
                  showColorCode: false,
                },
              }}
            />
          </div>
        </SurfaceCard>
      </div>
    </AppBarLayoutPage>
  );
};

export default withAllPermission(Dashboard);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<CondominiumType[]>("/condominium?query=all");
    return { props: { initialCondominium: data } };
  } catch {
    return { props: { initialCondominium: [] } };
  }
};
