import "../index.css";
import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Form,
  Button,
  Grid,
  Label,
  TextInput,
  Select,
} from "@trussworks/react-uswds";
import { CruiseContext, ACTIONS } from "../CruiseContext";
import { DatePicker } from "@nmfs-radfish/react-radfish";
import { useNavigate } from "react-router-dom";
import { post } from "../utils/requestMethods";

const API_BASE_URL = "http://localhost:5000";

const CruiseNewPage = () => {
  const navigate = useNavigate();
  const { dispatch, state } = useContext(CruiseContext);
  const { ports } = state;
  const [resetToggle, setResetToggle] = useState(false);
  const inputFocus = useRef(null);

  const handleNavCruisesList = () => {
    navigate("/cruises");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const values = { cruiseStatusId: 1, returnPort: null, endDate: null };

    for (const [key, value] of formData.entries()) {
      values[key] = value;
    }

    const newCruise = await post(`${API_BASE_URL}/cruises`, values);
    dispatch({ type: ACTIONS.SET_NEW_CRUISE, payload: newCruise });
    event.target.reset();
    setResetToggle(true);
    navigate(`/cruises/${newCruise.id}`);
  };

  const handleReset = (event) => {
    event.preventDefault();
    event.target.reset();
    setResetToggle(true);
  };

  useEffect(() => {
    if (inputFocus.current) {
      inputFocus.current.focus();
    }
    setResetToggle(false);
  }, [resetToggle]);

  return (
    <>
      <Grid col={12}>
        <Grid row className="margin-top-2">
          <Button className="margin-right-0" onClick={handleNavCruisesList}>&lt; Cruise List</Button>
        </Grid>
        <Grid row className="margin-top-2">
          <Grid col={12}>
            <Grid row>
              <h1 className="app-sec-header">New Cruise Form</h1>
            </Grid>
            <div className="border radius-lg padding-1 margin-y-2 app-card">
              <Form className="maxw-full" onSubmit={handleSubmit} onReset={handleReset}>
                <Grid row gap>
                  <Grid col={12} tablet={{ col: true }}>
                    <Grid row>
                      <Label htmlFor="cruise-name" className="margin-top-2 grid-col-4 text-bold" requiredMarker>
                        Cruise Name:
                      </Label>
                      <TextInput
                        id="cruise-name"
                        name="cruiseName"
                        className="grid-col-8"
                        inputRef={inputFocus}
                        required
                      />
                    </Grid>
                  </Grid>
                  <Grid col={12} tablet={{ col: true }}>
                    <Grid row>
                      <Label htmlFor="vessel-name" className="margin-top-2 grid-col-4 text-bold" requiredMarker>
                        Vessel Name:
                      </Label>
                      <TextInput id="vessel-name" name="vesselName" className="grid-col-8" required />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid row gap>
                  <Grid col={12} tablet={{ col: true }}>
                    <Grid row>
                      <Label htmlFor="start-date" className="margin-top-2 grid-col-4 text-bold" requiredMarker>
                        Start Date:
                      </Label>
                      <DatePicker id="start-date" name="startDate" className="margin-top-0 grid-col-8" required />
                    </Grid>
                  </Grid>
                  <Grid col={12} tablet={{ col: true }}>
                    <Grid row>
                      <Label htmlFor="departure-port-select" className="margin-top-2 grid-col-4 text-bold" requiredMarker>
                        Departure Port:
                      </Label>
                      <Select
                        id="departure-port-select"
                        name="departurePortId"
                        className="grid-col-8"
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
                  </Grid>
                </Grid>
                <Grid row className="flex-justify-end">
                  <Button type="reset" className="margin-right-0 mobile-lg:margin-right-1" secondary>
                    Reset
                  </Button>
                  <Button type="submit" className="margin-right-0" >Add Cruise</Button>
                </Grid>
              </Form>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default CruiseNewPage;
