import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type SelectionIds = string[];

type ControlerButtonPagesContextProps = {
  children: React.ReactNode;
};

type ControlerButtonPagesContextData = {
  openDialogCreateCondominium: boolean;
  setOpenDialogCreateCondominium: Dispatch<SetStateAction<boolean>>;
  checkboxCondominium: SelectionIds;
  setCheckboxCondominium: Dispatch<SetStateAction<SelectionIds>>;
  openDialogEditCondominium: boolean;
  setOpenDialogEditCondominium: Dispatch<SetStateAction<boolean>>;
  openDialogCreateScreens: boolean;
  setOpenDialogCreateScreens: Dispatch<SetStateAction<boolean>>;
  checkboxScreens: SelectionIds;
  setCheckboxScreens: Dispatch<SetStateAction<SelectionIds>>;
  checkboxRss: SelectionIds;
  setCheckboxRss: Dispatch<SetStateAction<SelectionIds>>;
  openDialogCreateRss: boolean;
  setOpenDialogCreateRss: Dispatch<SetStateAction<boolean>>;
  openDialogEditRss: boolean;
  setOpenDialogEditRss: Dispatch<SetStateAction<boolean>>;
  checkboxBanner: SelectionIds;
  setCheckboxBanner: Dispatch<SetStateAction<SelectionIds>>;
  openDialogCreateBanner: boolean;
  setOpenDialogCreateBanner: Dispatch<SetStateAction<boolean>>;
  openDialogEditBanner: boolean;
  setOpenDialogEditBanner: Dispatch<SetStateAction<boolean>>;
  checkboxUser: SelectionIds;
  setCheckboxUser: Dispatch<SetStateAction<SelectionIds>>;
  openDialogCreateUser: boolean;
  setOpenDialogCreateUser: Dispatch<SetStateAction<boolean>>;
  openDialogEditUser: boolean;
  setOpenDialogEditUser: Dispatch<SetStateAction<boolean>>;
  checkboxCondominiumMessenger: SelectionIds;
  setCheckboxCondominiumMessenger: Dispatch<SetStateAction<SelectionIds>>;
  openDialogCreateCondominiumMessenger: boolean;
  setOpenDialogCreateCondominiumMessenger: Dispatch<SetStateAction<boolean>>;
  openDialogEditCondominiumMessenger: boolean;
  setOpenDialogEditCondominiumMessenger: Dispatch<SetStateAction<boolean>>;
  openDialogCreateVms: boolean;
  setOpenDialogCreateVms: Dispatch<SetStateAction<boolean>>;
  checkboxVms: SelectionIds;
  setCheckboxVms: Dispatch<SetStateAction<SelectionIds>>;
  openDialogEditVms: boolean;
  setOpenDialogEditVms: Dispatch<SetStateAction<boolean>>;
  openDialogCreateNoticies: boolean;
  setOpenDialogCreateNoticies: Dispatch<SetStateAction<boolean>>;
  checkboxNoticies: SelectionIds;
  setCheckboxNoticies: Dispatch<SetStateAction<SelectionIds>>;
  openDialogEditNoticies: boolean;
  setOpenDialogEditNoticies: Dispatch<SetStateAction<boolean>>;
};

const ControlerButtonPagesContext = createContext({} as ControlerButtonPagesContextData);

export const useControlerButtonPagesContext = () => useContext(ControlerButtonPagesContext);

const ControlerButtonPagesProvider: React.FC<ControlerButtonPagesContextProps> = ({ children }) => {
  const [openDialogCreateCondominium, setOpenDialogCreateCondominium] = useState(false);
  const [openDialogEditCondominium, setOpenDialogEditCondominium] = useState(false);
  const [openDialogEditRss, setOpenDialogEditRss] = useState(false);
  const [openDialogCreateRss, setOpenDialogCreateRss] = useState(false);
  const [openDialogCreateScreens, setOpenDialogCreateScreens] = useState(false);
  const [openDialogCreateBanner, setOpenDialogCreateBanner] = useState(false);
  const [openDialogEditBanner, setOpenDialogEditBanner] = useState(false);
  const [openDialogCreateUser, setOpenDialogCreateUser] = useState(false);
  const [openDialogEditUser, setOpenDialogEditUser] = useState(false);
  const [openDialogCreateNoticies, setOpenDialogCreateNoticies] = useState(false);
  const [openDialogEditNoticies, setOpenDialogEditNoticies] = useState(false);
  const [openDialogCreateCondominiumMessenger, setOpenDialogCreateCondominiumMessenger] = useState(false);
  const [openDialogEditCondominiumMessenger, setOpenDialogEditCondominiumMessenger] = useState(false);
  const [openDialogCreateVms, setOpenDialogCreateVms] = useState(false);
  const [openDialogEditVms, setOpenDialogEditVms] = useState(false);
  const [checkboxCondominium, setCheckboxCondominium] = useState<SelectionIds>([]);
  const [checkboxScreens, setCheckboxScreens] = useState<SelectionIds>([]);
  const [checkboxRss, setCheckboxRss] = useState<SelectionIds>([]);
  const [checkboxBanner, setCheckboxBanner] = useState<SelectionIds>([]);
  const [checkboxUser, setCheckboxUser] = useState<SelectionIds>([]);
  const [checkboxCondominiumMessenger, setCheckboxCondominiumMessenger] = useState<SelectionIds>([]);
  const [checkboxVms, setCheckboxVms] = useState<SelectionIds>([]);
  const [checkboxNoticies, setCheckboxNoticies] = useState<SelectionIds>([]);

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
        openDialogCreateVms,
        setOpenDialogCreateVms,
        checkboxVms,
        setCheckboxVms,
        openDialogEditVms,
        setOpenDialogEditVms,
        openDialogCreateNoticies,
        setOpenDialogCreateNoticies,
        checkboxNoticies,
        setCheckboxNoticies,
        openDialogEditNoticies,
        setOpenDialogEditNoticies,
      }}
    >
      {children}
    </ControlerButtonPagesContext.Provider>
  );
};

export default ControlerButtonPagesProvider;
