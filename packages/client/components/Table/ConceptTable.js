import {React, useState, useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {getConceptList} from "../../features/corpus";
import { makeStyles } from "@material-ui/core/styles";
import {DataGrid} from '@mui/x-data-grid';
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import styles from "assets/jss/nextjs-material-dashboard/views/dashboardStyle.js";

import {Sparklines, SparklinesLine, SparklinesSpots} from "react-sparklines";

export default function ConceptTable() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  // HANDLE DATA UPDATES INTO STATE
  const dispatch = useDispatch();
  const { data, pending, error } = useSelector((state) => state.corpus);
  const conceptListColumns = [
    {
      field: 'concept_name',
      headerName: 'Concept',
      width: 220,
      type: 'string',
      editable: false
    },
    {
      field: 'paper_count',
      headerName: 'Paper Count',
      type: 'number',
      width: 120,
      editable: false,
    },
    {
      field: 'sem_category',
      headerName: 'Category',
      type: 'string',
      width: 120,
      editable: false,
    },
    {
      field: 'sem_type',
      headerName: 'Sem Type',
      type: 'string',
      width: 240,
      editable: false,
    }
  ];
return (
  <div style={{ height: 400, width: '100%' }}>
    {pending && <p>Loading...</p>}
    {data &&
      <DataGrid
        columns={conceptListColumns}
        pagination
        rowCount={data.conceptCount}
        rowHeight={30}
        rows={data.conceptList}
        paginationMode="server"
        onPageChange={(page) =>
            dispatch(getConceptList({
              corpusId:data.corpusId, pageSize:100, pageNumber:page
            }))}
        pageSize={100}
        rowsPerPageOptions={[100]}
      />}
  </div>
  );
}