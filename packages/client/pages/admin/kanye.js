import {React, useState, useEffect, useLayoutEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getKanyeQuote } from '../../features/kanye';
import { wrapper } from '../../app/store';

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

function kanye() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const dispatch = useAppDispatch();
  const { data, pending, error } = useAppSelector((state) => state.kanyeQuote);

  return (
    <div>
      <h2>Generate random Kanye West quote</h2>
      {pending && <p>Loading...</p>}
      {data && <p>{data.quote}</p>}
      {error && <p>Oops, something went wrong</p>}
      <button onClick={() => dispatch(getKanyeQuote())} disabled={pending}>
        Generate Kanye Quote
      </button>
    </div>
  );
}

kanye.getInitialProps = wrapper.getInitialPageProps(
  ({ dispatch }) =>
    async () => {
      await dispatch(getKanyeQuote());
    }
);

kanye.layout = Admin;

export default kanye;
