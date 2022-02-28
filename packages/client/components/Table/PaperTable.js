import {React, useState, useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {getPaperList} from "../../features/corpus";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {DataGrid} from '@mui/x-data-grid';
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import styles from "assets/jss/nextjs-material-dashboard/views/dashboardStyle.js";

import {Sparklines, SparklinesLine, SparklinesSpots} from "react-sparklines";

export default function PaperTable() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  // HANDLE DATA UPDATES INTO STATE
  const dispatch = useDispatch();
  const { data, pending, error } = useSelector((state) => state.corpus);
  const paperListColumns = [
    {
      field: 'id',
      headerName: 'PMID',
      width: 120,
      editable: false,
      resizable: true,
      renderCell: (params)=>(
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${params.value}`}
              target="_blank">{params.value}</a>
      )
    },
    {
      field: 'DOI',
      headerName: 'DOI',
      width: 150,
      editable: false,
      resizable: true,
      renderCell: (params)=>(
          <a href={`https://doi.org/${params.value}`}
              target="_blank">{params.value}</a>
      )
    },
    {
      field: 'CITATION_SCORE',
      headerName: 'CIT. SCORE',
      type: 'number',
      width: 60,
      editable: false,
      resizable: true,
    },
    {
      field: 'AUTHORS',
      headerName: 'AUTHORS',
      type: 'string',
      width: 150,
      editable: false,
      resizable: true
    },
    {
      field: 'YEAR',
      headerName: 'YEAR',
      type: 'date',
      width: 120,
      editable: false,
      resizable: true,
    },
    {
      field: 'TITLE',
      headerName: 'TITLE',
      type: 'string',
      width: 600,
      editable: false,
      resizable: true,
    },
    {
      field: 'JOURNAL_REF',
      headerName: 'Journal Ref.',
      type: 'string',
      width: 320,
      editable: false,
      resizable: true
    }
  ];
  return (
    <div style={{ height: 840, width: '100%' }}>
      {pending && <p>Loading...</p>}
      {data &&
        <DataGrid
          columns={paperListColumns}
          pagination
          rowCount={data.paperCount}
          rowHeight={30}
          rows={data.paperList}
          paginationMode="server"
          onPageChange={(page) =>
              dispatch(getPaperList({
                corpusId:data.corpusId, pageSize:100, pageNumber:page
              }))}
          pageSize={100}
          rowsPerPageOptions={[100]}
        />}
    </div>
  );
}