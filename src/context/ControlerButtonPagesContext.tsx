import { GridRowId } from "@mui/x-data-grid-pro";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

type ControlerButtonPagesContextProps = {
  children: React.ReactNode;
};
type ControlerButtonPagesContextData = {
  openDialogCreateCondominium: boolean;
  setOpenDialogCreateCondominium: Dispatch<SetStateAction<boolean>>;
  checkboxCondominium: GridRowId[];
  setCheckboxCondominium: Dispatch<SetStateAction<GridRowId[]>>;
  openDialogEditCondominium: boolean;
  setOpenDialogEditCondominium: Dispatch<SetStateAction<boolean>>;
  openDialogCreateScreens: boolean;
  setOpenDialogCreateScreens: Dispatch<SetStateAction<boolean>>;
  checkboxScreens: GridRowId[];
  setCheckboxScreens: Dispatch<SetStateAction<GridRowId[]>>;
  checkboxRss: GridRowId[];
  setCheckboxRss: Dispatch<SetStateAction<GridRowId[]>>;
  openDialogCreateRss: boolean;
  setOpenDialogCreateRss: Dispatch<SetStateAction<boolean>>;
  openDialogEditRss: boolean;
  setOpenDialogEditRss: Dispatch<SetStateAction<boolean>>;
  checkboxBanner: GridRowId[];
  setCheckboxBanner: Dispatch<SetStateAction<GridRowId[]>>;
  openDialogCreateBanner: boolean;
  setOpenDialogCreateBanner: Dispatch<SetStateAction<boolean>>;
  openDialogEditBanner: boolean;
  setOpenDialogEditBanner: Dispatch<SetStateAction<boolean>>;
  checkboxUser: GridRowId[];
  setCheckboxUser: Dispatch<SetStateAction<GridRowId[]>>;
  openDialogCreateUser: boolean;
  setOpenDialogCreateUser: Dispatch<SetStateAction<boolean>>;
  openDialogEditUser: boolean;
  setOpenDialogEditUser: Dispatch<SetStateAction<boolean>>;
  checkboxCondominiumMessenger: GridRowId[];
  setCheckboxCondominiumMessenger: Dispatch<SetStateAction<GridRowId[]>>;
  openDialogCreateCondominiumMessenger: boolean;
  setOpenDialogCreateCondominiumMessenger: Dispatch<SetStateAction<boolean>>;
  openDialogEditCondominiumMessenger: boolean;
  setOpenDialogEditCondominiumMessenger: Dispatch<SetStateAction<boolean>>;
};

const ControlerButtonPagesContext = createContext(
  {} as ControlerButtonPagesContextData
);

export const useControlerButtonPagesContext = () => {
  return useContext(ControlerButtonPagesContext);
};

const ControlerButtonPagesProvider: React.FC<
  ControlerButtonPagesContextProps
> = ({ children }) => {
  const [openDialogCreateCondominium, setOpenDialogCreateCondominium] =
    useState(false);
  const [openDialogEditCondominium, setOpenDialogEditCondominium] =
    useState(false);
  const [openDialogEditRss, setOpenDialogEditRss] = useState(false);
  const [openDialogCreateRss, setOpenDialogCreateRss] = useState(false);
  const [openDialogCreateScreens, setOpenDialogCreateScreens] = useState(false);
  const [openDialogCreateBanner, setOpenDialogCreateBanner] = useState(false);
  const [openDialogEditBanner, setOpenDialogEditBanner] = useState(false);
  const [openDialogCreateUser, setOpenDialogCreateUser] = useState(false);
  const [openDialogEditUser, setOpenDialogEditUser] = useState(false);
  const [
    openDialogCreateCondominiumMessenger,
    setOpenDialogCreateCondominiumMessenger,
  ] = useState(false);
  const [
    openDialogEditCondominiumMessenger,
    setOpenDialogEditCondominiumMessenger,
  ] = useState(false);
  const [checkboxCondominium, setCheckboxCondominium] = useState<GridRowId[]>(
    []
  );
  const [checkboxScreens, setCheckboxScreens] = useState<GridRowId[]>([]);
  const [checkboxRss, setCheckboxRss] = useState<GridRowId[]>([]);
  const [checkboxBanner, setCheckboxBanner] = useState<GridRowId[]>([]);
  const [checkboxUser, setCheckboxUser] = useState<GridRowId[]>([]);
  const [checkboxCondominiumMessenger, setCheckboxCondominiumMessenger] =
    useState<GridRowId[]>([]);

  return (
    <ControlerButtonPagesContext.Provider
      value={{
        openDialogCreateCondominium,
        setOpenDialogCreateCondominium,
        checkboxCondominium,
        setCheckboxCondominium,
        openDialogEditCondominium,
        setOpenDialogEditCondominium,
        openDialogCreateScreens,
        setOpenDialogCreateScreens,
        checkboxScreens,
        setCheckboxScreens,
        checkboxRss,
        setCheckboxRss,
        openDialogCreateRss,
        setOpenDialogCreateRss,
        openDialogEditRss,
        setOpenDialogEditRss,
        checkboxBanner,
        setCheckboxBanner,
        openDialogCreateBanner,
        setOpenDialogCreateBanner,
        openDialogEditBanner,
        setOpenDialogEditBanner,
        checkboxUser,
        setCheckboxUser,
        openDialogCreateUser,
        setOpenDialogCreateUser,
        openDialogEditUser,
        setOpenDialogEditUser,
        checkboxCondominiumMessenger,
        setCheckboxCondominiumMessenger,
        openDialogCreateCondominiumMessenger,
        setOpenDialogCreateCondominiumMessenger,
        openDialogEditCondominiumMessenger,
        setOpenDialogEditCondominiumMessenger,
      }}
    >
      {children}
    </ControlerButtonPagesContext.Provider>
  );
};

export default ControlerButtonPagesProvider;
