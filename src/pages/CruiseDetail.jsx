import "../index.css";
import React, { useState } from "react";
import {
  Button,
  Grid,
  Fieldset,
  Tag,
  Form,
  Label,
  TextInput,
  DatePicker,
  Select
} from "@trussworks/react-uswds";
import StationSummary from "../components/StationSummary";
import StationNew from "../components/StationNew";
import DescriptionListItem from "../components/DescriptionListItem";
import { useNavigate, useParams } from "react-router-dom";
import { listValueLookup, CruiseStatus } from "../utils/listLookup";
import { setStatusColor } from "../utils/setStatusColor";
import { generateTzDateTime, getLocationTz } from "../utils/dateTimeHelpers";
import { post, put } from "../utils/requestMethods";

const CruiseDetailPage = ({ data }) => {
  const { cruise: initialCruise, stations: initialStations } = data;
  const [cruise, setCruise] = useState(initialCruise);
  const {
    id,
    cruiseName,
    cruiseStatusId,
    vesselName,
    startDate,
    endDate,
    departurePortId,
    returnPortId,
  } = cruise;
  const navigate = useNavigate();
  const { state } = useContext(CruiseContext);
  const { ports, cruiseStatuses } = state;
  const [activeAction, setActiveAction] = useState(null);
  const cruiseStatus = listValueLookup(cruiseStatuses, cruiseStatusId);
  const departurePort = listValueLookup(ports, departurePortId);
  const returnPort = listValueLookup(ports, returnPortId);
  const [stations, setStations] = useState(initialStations);
  const cruiseStatusIdStr = cruiseStatusId.toString();
  const handleNavCruisesList = () => {
    navigate("/cruises");
  };

  const CruiseAction = {
    NEW: "NEW",
    EDIT: "EDIT",
  };

  const handleSaveCruise = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const values = {
      id,
      cruiseName,
      cruiseStatusId,
      vesselName,
      startDate,
      endDate,
      departurePortId,
      returnPortId
    };

    for (const [key, value] of formData.entries()) {
      values[key] = value;
    }

    const updatedCruise = await put(`/api/cruises/${id}`, values);
    setActiveAction(null);
    setCruise(updatedCruise);
  };

  const handleNewStation = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const values = { cruiseId: id };

    for (const [key, value] of formData.entries()) {
      values[key] = value;
    }

    const timezone = getLocationTz(values.latitude, values.longitude);
    const beginSetDateTime = generateTzDateTime(values.eventDate, values.eventTime, timezone);
    const newValues = structuredClone(InitializedStation);
    newValues.cruiseId = values.cruiseId;
    newValues.stationName = values.stationName;
    const newBeginSetValues = {
      timestamp: beginSetDateTime,
      latitude: values.latitude,
      longitude: values.longitude,
      windSpeedKnots: values.windSpeed,
      waveHeightMeters: values.waveHeight,
      visibilityKm: values.visibility,
      precipitationId: values.precipitationId,
      comments: values.comments
    };
    newValues.events.beginSet = newBeginSetValues;

    // process date time
    const newStation = await post(`/api/stations`, newValues);
    event.target.reset();
    setActiveAction(null);
    setStations([newStation, ...stations]);
  }

  return (
    <>
      <Grid row className="margin-top-2">
        <Button className="margin-right-0" onClick={handleNavCruisesList}>&lt; Cruise List</Button>
      </Grid>
      <Grid row className="flex-justify margin-top-2">
        <h1 className="app-sec-header">Cruise Details</h1>
        <div className="margin-top-05 margin-bottom-2 mobile-lg:margin-bottom-0">
          <Tag className={`padding-1 usa-tag--big ${setStatusColor(cruiseStatusId)}`}>{cruiseStatus}</Tag>
        </div>
        {
          activeAction === CruiseAction.EDIT
            ? <Button
              className="margin-right-0"
              onClick={() => setActiveAction(null)}
              secondary
            >
              "Cancel Edit Cruise"
            </Button>
            : <Button
              className="margin-right-0"
              onClick={() => setActiveAction(CruiseAction.EDIT)}
              disabled={activeAction !== null && activeAction !== CruiseAction.EDIT}
            >
              Edit Cruise
            </Button>
        }
      </Grid>
      <div className="border radius-lg padding-1 margin-y-2 app-card">
        {activeAction !== null && activeAction === CruiseAction.EDIT
          ?
          <Form className="maxw-full" onSubmit={handleSaveCruise}>
            <Grid row gap>
              <Grid col={12} tablet={{ col: true }}>
                <Grid row>
                  <Label htmlFor="cruise-name" className="grid-col-4 text-bold margin-top-2" requiredMarker>
                    Cruise Name:
                  </Label>
                  <TextInput id="cruise-name" name="cruiseName" className="grid-col-8" defaultValue={cruiseName} required />
                </Grid>
              </Grid>
              <Grid col={12} tablet={{ col: true }}>
                <Grid row>
                  <Label htmlFor="vessel-name" className="grid-col-4 text-bold margin-top-2" requiredMarker>
                    Vessel Name:
                  </Label>
                  <TextInput id="vessel-name" name="vesselName" className="grid-col-8" defaultValue={vesselName} required />
                </Grid>
              </Grid>
            </Grid>
            <Grid row gap>
              <Grid col={12} tablet={{ col: true }}>
                <Fieldset legend="Departure" className="app-legend-bold-text">
                  <Grid row>
                    <Label htmlFor="start-date" className="grid-col-4 text-bold margin-top-2" requiredMarker>
                      Date:
                    </Label>
                    <DatePicker id="start-date" name="startDate" className="grid-col-8 margin-top-0" defaultValue={startDate} required />
                  </Grid>
                  <Grid row>
                    <Label htmlFor="departure-port-select" className="grid-col-4 text-bold margin-top-2" requiredMarker>
                      Port:
                    </Label>
                    <Select
                      id="departure-port-select"
                      name="departurePortId"
                      className="grid-col-8"
                      defaultValue={departurePortId}
                      required
                    >
                      <option value={null}>- Select Port -</option>
                      {ports.map((port) => (
                        <option key={port.id} value={port.id}>
                          {port.name}
                        </option>
                      ))}
                    </Select>
                  </Grid>
                </Fieldset>
              </Grid>
              <Grid col>
                <Fieldset legend="Return" className="app-legend-bold-text">
                  <Grid row>
                    <Label htmlFor="end-date" className="grid-col-4 text-bold margin-top-2" >
                      Date:
                    </Label>
                    <DatePicker id="end-date" name="endDate" className="grid-col-8 margin-top-0" defaultValue={endDate} />
                  </Grid>
                  <Grid row>
                    <Label htmlFor="return-port-select" className="grid-col-4 text-bold margin-top-2" >
                      Port:
                    </Label>
                    <Select
                      id="return-port-select"
                      name="returnPortId"
                      className="grid-col-8"
                      defaultValue={returnPortId}
                    >
                      <option value={null}>- Select Port -</option>
                      {ports.map((port) => (
                        <option key={port.id} value={port.id}>
                          {port.name}
                        </option>
                      ))}
                    </Select>
                  </Grid>
                </Fieldset>
              </Grid>
            </Grid>
            <Grid row className="flex-column flex-align-end">
              <Button type="submit" className="margin-right-0">Save Cruise</Button>
            </Grid>
          </Form>
          : <>
            <Grid row>
              <Grid col={12} tablet={{ col: true }}>
                <DescriptionListItem term="Cruise Name:" description={cruiseName} />
              </Grid>
              <Grid col={12} tablet={{ col: true }}>
                <DescriptionListItem term="Vessel Name:" description={vesselName} />
              </Grid>
            </Grid>
            <Grid row className="margin-top-2">
              <Grid col={12} tablet={{ col: true }}>
                <Fieldset legend="Departure" className="app-legend-bold-text">
                  <DescriptionListItem term="Date:" description={startDate} />
                  <DescriptionListItem term="Port:" description={departurePort} />
                </Fieldset>
              </Grid>
              <Grid col>
                <Fieldset legend="Return" className="app-legend-bold-text">
                  <DescriptionListItem term="Date:" description={endDate} />
                  <DescriptionListItem term="Port:" description={returnPort} />
                </Fieldset>
              </Grid>
            </Grid>
          </>
        }
      </div>
      <Grid row className="flex-justify margin-bottom-1">
        <h2 className="app-sec-header">Stations</h2>
        {
          activeAction === CruiseAction.NEW
            ? <Button
              className="margin-right-0"
              onClick={() => setActiveAction(null)}
              secondary
            >
              Cancel New Station
            </Button>
            : <Button
              className="margin-right-0"
              onClick={() => setActiveAction(CruiseAction.NEW)}
              disabled={activeAction !== null && activeAction !== CruiseAction.NEW}
            >
              New Station
            </Button>
        }
      </Grid>
      {activeAction === CruiseAction.NEW && <StationNew handleNewStation={handleNewStation} />}
      {stations.length
        ? stations.map((station) => (
          <StationSummary
            key={station.id}
            cruiseId={id}
            station={station}
            activeAction={activeAction} />
        ))
        : ""}
    </>
  );
}

export default CruiseDetailPage;

const InitializedStation = {
  cruiseId: null,
  stationName: null,
  events: {
    beginSet: {
      timestamp: null,
      latitude: null,
      longitude: null,
      windSpeedKnots: null,
      waveHeightMeters: null,
      visibilityKm: null,
      precipitationId: null,
      comments: null
    },
  }
}