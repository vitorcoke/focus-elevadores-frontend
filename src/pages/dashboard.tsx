import { GetServerSideProps } from "next";
import AppBarLayoutPage from "../layout/AppBar";
import { getAPIClient } from "../service";

const Deshboard = () => {
  return (
    <AppBarLayoutPage>
      <div>teste</div>
    </AppBarLayoutPage>
  );
};

export default Deshboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  return {
    props: {},
  };
};
