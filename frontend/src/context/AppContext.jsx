import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [doctors, setDoctors] = useState([]);
  const [user, setUser] = useState(null); 
  const [patient, setPatient] = useState(null); 
  const [unreadCount, setUnreadCount] = useState(0);
  const currencySymbol = "$";

  const value = {
    doctors,
    setDoctors,
    user,
    setUser,
    patient,
    setPatient,
    unreadCount,
    setUnreadCount,
    currencySymbol,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

// Prop validation
AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContextProvider;
