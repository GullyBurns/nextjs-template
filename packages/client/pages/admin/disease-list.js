import {React, useState, useEffect, useLayoutEffect } from 'react'

// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import { DataGrid,GridColDef } from '@mui/x-data-grid';

// layout for this page
import Admin from "layouts/Admin.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

import { bugs, website, server } from "variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
} from "variables/charts.js";

import styles from "assets/jss/nextjs-material-dashboard/views/dashboardStyle.js";

function DiseaseList({rao_group_data}) {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const columns = [
    { field: 'id', headerName: 'ID', width: 60 },
    {
      field: 'Disease Name',
      headerName: 'Disease Name',
      width: 450,
      editable: false,
    },
    {
      field: 'MONDO CODES',
      headerName: 'MONDO CODES',
      width: 300,
      editable: false,
    },
    {
      field: 'Cycle',
      headerName: 'Cycle',
      type: 'number',
      width: 60,
      editable: false,
    }
  ];

  // Setting diseaseId for this page from the control.
  const [diseaseId, setDiseaseId] = useState(-1);

  // Storing/Retrieving the diseaseId in sessionStorage.
  useEffect(() => {
    sessionStorage.setItem('diseaseId', diseaseId.toString())
  }, [diseaseId])
  useLayoutEffect(() => {
    if (sessionStorage.getItem('diseaseId')) {
      setDiseaseId(parseInt(sessionStorage.getItem('diseaseId')))
    } else {
      sessionStorage.setItem('diseaseId', diseaseId.toString())
    }
  }, [])

  return (
    <div>
      <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Rare as One Diseases </h4>
            <p className={classes.cardCategoryWhite}>
              All diseases of direct interest to the Rare as One program,
              either as diseases of interest to members of the research network
              of for the extended Rare As One team.
            </p>
          </CardHeader>
          <CardBody>
            <p>{diseaseId}</p>
          <div style={{ height: 800, width: '100%' }}>
            <DataGrid
              rows={rao_group_data}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              onSelectionModelChange={(ids) => setDiseaseId(ids)}
            />
          </div>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
    </div>
  );
}

import {MyD3Component} from "../../components/D3/MyD3Component";
export async function getServerSideProps() {
  const res = await fetch(`http://10.0.0.184:5001/api/read/RaO/rao_groups`)
  const rao_group_data = await res.json()
  return { props: { rao_group_data } }
}

DiseaseList.layout = Admin;

export default DiseaseList;
