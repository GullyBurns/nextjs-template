import {React, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {fetch_corpus_list, select_corpus_id, set_corpus_list} from '../../features/corpusSlice'

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

function ResearcherList({list_authors}) {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  // HANDLE DATA UPDATES INTO STATE
  const dispatch = useDispatch()
  dispatch(set_author_list(list_authors))
  const corpora = useSelector((state) => state.corpus)

  const columns = [
    {
      field: 'CORPUS_NAME',
      headerName: 'Disease Name',
      width: 450,
      editable: false,
    },
    {
      field: 'author_name',
      headerName: 'Name',
      width: 300,
      editable: false,
    },
    {
      field: 'author_name',
      headerName: 'ORCID',
      width: 300,
      editable: false,
      renderCell: (params)=>(
          <a
              href={`https://http://orcid.org/${params.value}`}
              target="_blank"
          >{params.value}</a>
      )
    },
    {
      field: 'normalized_citation_count',
      headerName: 'Normalized Citation Count',
      type: 'number',
      width: 120,
      editable: false,
    }
  ];

  // Setting diseaseId for this page from the control.
  const [authorId, setAuthorId] = useState(-1);

  const handleSelectionModelChange = id => {
    console.log('CLICK')
    dispatch( select_author_id(id) )
  }

  // Storing/Retrieving the diseaseId in sessionStorage.
  //useEffect(() => {
  //  sessionStorage.setItem('diseaseId', diseaseId.toString())
  //}, [diseaseId])
  //useLayoutEffect(() => {
  //  if (sessionStorage.getItem('diseaseId')) {
  //    setDiseaseId(parseInt(sessionStorage.getItem('diseaseId')))
  //  } else {
  //    sessionStorage.setItem('diseaseId', diseaseId.toString())
  //  }
  //}, [])

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
            <DataGrid
              rows={corpora.author_list}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              onSelectionModelChange={handleSelectionModelChange}
            />
          </div>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
    </div>
  );
}

// SHOULD BE DOING THIS WITH DISPATCHING SERVER SIDE EVENTS
// BUT CANNOT GET THE createAsyncThunk call CALL TO EXECUTE WITHOUT
// TRIGGERING AN ERROR - SAVE AS PLACEHOLDER AND KEEP INTERACTION
// VIA SERVER SIDE PROPS + SIMPLE DISPATCH FOR
export async function getServerSideProps() {
  const corpora = useSelector((state) => state.corpus)
  const corpus_id = corpora.corpus_id
  const url = 'http://10.0.0.184:5001/api/list_authors/'+corpus_id+'/0/20'
  const res = await fetch(url)
  const list_authors = await res.json()
  return { props: { list_authors } }
}

ResearcherList.layout = Admin;

export default ResearcherList;
