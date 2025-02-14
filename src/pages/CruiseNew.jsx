import "../index.css";
import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Button,
  Grid,
  GridContainer,
  Label,
  TextInput,
  Select,
} from "@trussworks/react-uswds";
import { AppCard, ResponsiveRow, GoBackButton } from "../components";
import { DatePicker } from "@nmfs-radfish/react-radfish";
import { useNavigate } from "react-router-dom";
import {
  useAuth,
  useListTablesContext,
  useCruisesAndStationsContext,
} from "../context";

const CruiseNewPage = () => {
  const { user } = useAuth();
  const { lists } = useListTablesContext();
  const { refreshCruisesState, addCruise, loading } =
    useCruisesAndStationsContext();
  const { ports } = lists;
  const navigate = useNavigate();
  const [resetToggle, setResetToggle] = useState(false);
  const inputFocus = useRef(null);

  useEffect(() => {
    if (inputFocus.current) {
      inputFocus.current.focus();
    }
    setResetToggle(false);
  }, [resetToggle]);

  if (loading) return;

  const handleNewCruise = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newCruise = {
      id: crypto.randomUUID(),
      cruiseStatusId: 1,
      returnPort: null,
      endDate: null,
    };

    for (const [key, value] of formData.entries()) {
      newCruise[key] = value;
    }

    try {
      await addCruise(user.id, newCruise);
      refreshCruisesState(user.id);
      event.target.reset();
      setResetToggle(true);
      navigate(`/cruises/${newCruise.id}`);
    } catch (error) {
      console.error("Failed to save cruise: ", error);
    }
  };

  const handleReset = (event) => {
    event.preventDefault();
    event.target.reset();
    setResetToggle(true);
  };

  return (
    <GridContainer className="usa-section">
      <Grid col={12}>
        <Grid row className="margin-top-2">
          <GoBackButton to="/cruises" label="Cruise List" />
        </Grid>
        <Grid row className="margin-top-2">
          <Grid col={12}>
            <Grid row>
              <h1 className="app-sec-header">New Cruise Form</h1>
            </Grid>
            <AppCard>
              <Form
                className="maxw-full"
                onSubmit={handleNewCruise}
                onReset={handleReset}
              >
                <ResponsiveRow>
                  <Label
                    htmlFor="cruise-name"
                    className="margin-top-2 text-bold"
                    requiredMarker
                  >
                    Cruise Name:
                  </Label>
                  <TextInput
                    id="cruise-name"
                    name="cruiseName"
                    className=""
                    inputRef={inputFocus}
                    required
                  />
                  <Label
                    htmlFor="vessel-name"
                    className="margin-top-2 text-bold"
                    requiredMarker
                  >
                    Vessel Name:
                  </Label>
                  <TextInput
                    id="vessel-name"
                    name="vesselName"
                    className=""
                    required
                  />
                </ResponsiveRow>
                <ResponsiveRow>
                  <Label
                    htmlFor="start-date"
                    className="margin-top-2 text-bold"
                    requiredMarker
                  >
                    Start Date:
                  </Label>
                  <DatePicker
                    id="start-date"
                    name="startDate"
                    className="margin-top-0"
                    required
                  />
                  <Label
                    htmlFor="departure-port-select"
                    className="margin-top-2 text-bold"
                    requiredMarker
                  >
                    Departure Port:
                  </Label>
                  <Select
                    id="departure-port-select"
                    name="departurePortId"
                    required
                  >
                    <option value={null}>- Select Port -</option>
                    {ports.map((port) => (
                      <option key={port.id} value={port.id}>
                        {port.name}
                      </option>
                    ))}
                  </Select>
                </ResponsiveRow>
                <Grid row className="flex-justify-end">
                  <Button
                    type="reset"
                    className="margin-right-0 mobile-lg:margin-right-1"
                    secondary
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    className="btn-fix-top-3 margin-right-0"
                  >
                    Add Cruise
                  </Button>
                </Grid>
              </Form>
            </AppCard>
          </Grid>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default CruiseNewPage;
