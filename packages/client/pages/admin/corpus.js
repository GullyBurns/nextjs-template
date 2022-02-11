import {React, useState, useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {getCorpusList, setAuthorPage, selectCorpusId, getAuthorList} from "../../features/corpus";
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

import {Sparklines, SparklinesLine, SparklinesSpots} from "react-sparklines";
import PaperTimeHistogram from "../../components/D3/PaperTimeHistogram";

function CorpusDashboard() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  // HANDLE DATA UPDATES INTO STATE
  const dispatch = useDispatch();
  const { data, pending, error } = useSelector((state) => state.corpus);
  const authorListColumns = [
    {
      field: 'author_json',
      headerName: 'Author',
      width: 220,
      editable: false,
      renderCell: (params)=>(
          typeof JSON.parse(params.value).orcid_id !== 'undefined' ? (
          <a href={`https://orcid.org/${JSON.parse(params.value).orcid_id}`}
              target="_blank">{JSON.parse(params.value).author_name}</a> ):(
          <p>{JSON.parse(params.value).author_name}</p>)
      )
    },
    {
      field: 'weighted_citation_score',
      headerName: 'Citation Score',
      type: 'number',
      width: 120,
      editable: false,
    },
    {
      field: 'weighted_pub_score',
      headerName: 'Pubs Score',
      type: 'number',
      width: 120,
      editable: false,
    },
    {
      field: 'pubs_per_year',
      headerName: 'Pubs (2000-2022)',
      width: 180,
      editable: false,
      renderCell: (params)=>(
        <>
          <small>{Math.max(...params.value)}</small>
          <Sparklines data={params.value}
                      limit={22}
                      width={160}
                      height={50}
                      margin={5}>
            <SparklinesLine style={{fill:"none"}}/>
            <SparklinesSpots />
          </Sparklines>
        </>
      )
    }
  ];
  return (
    <div>
      {data.corpusId>-1 && <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <Card>
          <CardHeader color="danger">
            <h4 className={classes.cardTitleWhite}>Pubmed Histogram</h4>
            <p className={classes.cardCategoryWhite}>
              Distribution of published papers over time
            </p>
          </CardHeader>
          <CardBody>
              <PaperTimeHistogram/>
          </CardBody>
        </Card>
      </GridItem>
        <GridItem xs={12} sm={12} md={6}>
            <Card>
            <CardHeader color="danger">
              <h4 className={classes.cardTitleWhite}>Author List</h4>
              <p className={classes.cardCategoryWhite}>
                Tabulate Authors.
              </p>
            </CardHeader>
            <CardBody>
            <div style={{ height: 840, width: '100%' }}>
              {pending && <p>Loading...</p>}
              {data &&
                <DataGrid
                  columns={authorListColumns}
                  pagination
                  rowCount={data.authorCount}
                  rowHeight={50}
                  rows={data.authorList}
                  paginationMode="server"
                  onPageChange={(page) =>
                      dispatch(getAuthorList({
                        corpusId:data.corpusId, pageSize:100, pageNumber:page
                      }))}
                  pageSize={100}
                  rowsPerPageOptions={[100]}
                />}
            </div>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer> }
      {error && <p>Oops, something went wrong</p>}
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
