import {React, useState, useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {getCorpusList, selectCorpusId} from "../../features/corpus";
import {wrapper} from "../../app/store";

// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import {DataGrid, GridColDef, GridRenderCellParams} from '@mui/x-data-grid';

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

function CorpusDashboard() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  // HANDLE DATA UPDATES INTO STATE
  const dispatch = useDispatch();
  const { data, pending, error } = useSelector((state) => state.corpus);
  const authorListColumns = [
    {
      field: 'author_name',
      headerName: 'Author Name',
      width: 300,
      editable: false,
    },
    {
      field: 'id_orcid',
      headerName: 'ORCID',
      width: 300,
      editable: false,
      renderCell: (params)=>(
          <a
              href={`https://orcid.org/${params.value}`}
              target="_blank"
          >{params.value}</a>
      )
    },
    {
      field: 'normalized_citation_count',
      headerName: 'Normalized Citations',
      type: 'number',
      width: 180,
      editable: false,
    }
  ];

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="danger">
            <h4 className={classes.cardTitleWhite}>Author List </h4>
            <p className={classes.cardCategoryWhite}>
              Tabulate Authors.
            </p>
          </CardHeader>
          <CardBody>
          <div style={{ height: 320, width: '100%' }}>
            {pending && <p>Loading...</p>}
            {data &&
              <DataGrid
              rows={data.authorList}
              columns={authorListColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              />
            }
            {error && <p>Oops, something went wrong</p>}
          </div>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
    </div>
  );
}

CorpusDashboard.getInitialProps = wrapper.getInitialPageProps(
  ({ dispatch }) =>
    async () => {
      await dispatch(getCorpusList());
    }
);

CorpusDashboard.layout = Admin;

export default CorpusDashboard;
