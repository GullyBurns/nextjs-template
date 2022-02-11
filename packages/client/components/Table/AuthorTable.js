import {React, useState, useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {getAuthorList} from "../../features/corpus";
import { makeStyles } from "@material-ui/core/styles";
import {DataGrid} from '@mui/x-data-grid';
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import styles from "assets/jss/nextjs-material-dashboard/views/dashboardStyle.js";

import {Sparklines, SparklinesLine, SparklinesSpots} from "react-sparklines";

export default function AuthorTable() {
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
  );
}