import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useOfflineStatus } from "@nmfs-radfish/react-radfish";
import { useAuth } from './AuthContext';
import { useCruiseAndStations } from '../hooks/useCruisesAndStations';
import { CruiseStatus } from "../utils/listLookup";

const CruisesAndStationsContext = createContext();

export const CruisesAndStationsProvider = ({ children }) => {
  const lockedStatuses = [CruiseStatus.SUBMITTED, CruiseStatus.ACCEPTED];
  const { isOffline } = useOfflineStatus();
  const { initializeDataFromBackend,
    fetchLocalCruises,
    fetchLocalStations,
    addCruise,
    updateCruise,
    addStation,
    updateStation } = useCruiseAndStations();
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: false,
    warning: null,
    error: null,
    cruises: [],
    stations: [],
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        if (user?.id) {
          setState((prevState) => ({ ...prevState, loading: true }));
          if (!isOffline) await initializeDataFromBackend(user.id);
          const cruises = await fetchLocalCruises(user.id);
          const stations = await fetchLocalStations(user.id);

          setState((prevState) => ({
            ...prevState,
            cruises, stations,
            warning: cruises.length === 0 || stations.length === 0
          }));
        }
      } catch (error) {
        console.error("Error initializing cruises and stations: ", error);
        setState((prevState) => ({ ...prevState, error }));
      } finally {
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    };

    initialize();
  }, [user, isOffline]);

  const refreshCruisesState = async (userId) => {
    setState((prevState) => ({ ...prevState, loading: true }));
    try {
      const cruises = await fetchLocalCruises(userId);
      setState((prevState) => ({
        ...prevState,
        cruises
      }));
    } catch (error) {
      setState((prevState) => ({ ...prevState, error }));
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  }

  const refreshStationsState = async (userId) => {
    setState((prevState) => ({ ...prevState, loading: true }));
    try {
      const stations = await fetchLocalStations(userId);
      setState((prevState) => ({
        ...prevState,
        stations
      }));
    } catch (error) {
      setState((prevState) => ({ ...prevState, error }));
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  }

  const getCruiseById = (cruiseId) => {
    return state.cruises.find((cruise) => cruise.id === cruiseId);
  };

  const getStationById = (stationId) => {
    return state.stations.find((station) => station.id === stationId);
  };

  const getStationsByCruiseId = (cruiseId) => {
    return state.stations.filter((station) => station.cruiseId === cruiseId);
  };

  const useCruiseStatusLock = (cruiseId) => {
    const cruise = getCruiseById(cruiseId);
    const isStatusLocked = useMemo(() => {
      if (!cruise || !cruise.cruiseStatusId) return false;
      return lockedStatuses.includes(`${cruise.cruiseStatusId}`);
    }, [cruise]);

    return { isStatusLocked };
  }

  return (
    <CruisesAndStationsContext.Provider
      value={{
        ...state,
        refreshCruisesState,
        refreshStationsState,
        getCruiseById,
        getStationById,
        getStationsByCruiseId,
        addCruise,
        updateCruise,
        addStation,
        updateStation,
        useCruiseStatusLock,
      }}>
      {children}
    </CruisesAndStationsContext.Provider>
  );
};


export const useCruisesAndStationsContext = () => useContext(CruisesAndStationsContext);