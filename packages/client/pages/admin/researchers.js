import {React, useState, useEffect, useLayoutEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {fetch_corpus_list, select_corpus_id, set_corpus_list} from '../../features/corpusSlice'

import Link from 'next/link'
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

function ResearcherPage() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const dispatch = useDispatch()
  //{CORPUS_NAME: 'BLAH Ciliary Dyskinesia',MONDO_CODES: 'MONDO:0016575', OA_PAPER_COUNT: 960, PAPER_COUNT: 2539, id: '0'},
//    {CORPUS_NAME: 'Fibrolamellar hepatocellular carcinoma', MONDO_CODES: 'MONDO:0006210', OA_PAPER_COUNT: 244, PAPER_COUNT: 811, id: '14'},
//      {CORPUS_NAME: 'Primary sclerosing cholangitis', MONDO_CODES: 'MONDO:0013433', OA_PAPER_COUNT: 1795, PAPER_COUNT: 5334, id: '25'},
//     {CORPUS_NAME: 'Amyotrophic lateral sclerosis', MONDO_CODES: 'MONDO:0004976', OA_PAPER_COUNT: 25508, PAPER_COUNT: 57964, id: '34'}]

  dispatch(set_corpus_list(10))

  const columns = [
    {
      field: 'CORPUS_NAME',
      headerName: 'Disease Name',
      width: 450,
      editable: false,
    },
    {
      field: 'MONDO_CODES',
      headerName: 'LINKS',
      width: 300,
      editable: false,
      renderCell: (params)=>(
          <a
              href={`https://monarchinitiative.org/disease/${params.value}`}
              target="_blank"
          >{params.value}</a>
      )
    },
    {
      field: 'PAPER_COUNT',
      headerName: '# Papers',
      type: 'number',
      width: 120,
      editable: false,
    },
    {
      field: 'OA_PAPER_COUNT',
      headerName: '# OA Papers',
      type: 'number',
      width: 120,
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
          <CardHeader color="danger">
            <h4 className={classes.cardTitleWhite}>Disease List </h4>
            <p className={classes.cardCategoryWhite}>
              Select a disease to investigate.
            </p>
          </CardHeader>
          <CardBody>
          <div style={{ height: 320, width: '100%' }}>

          </div>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
    </div>
  );
}

import {MyD3Component} from "../../components/D3/MyD3Component";
//export async function getServerSideProps() {
//  const res = await fetch(`http://10.0.0.184:5001/api/list_authors/{corpusId}/25/0`)
//  const researcher_data = await res.json()
//  return { props: { researcher_data } }
//}

ResearcherPage.layout = Admin;

export default ResearcherPage;
