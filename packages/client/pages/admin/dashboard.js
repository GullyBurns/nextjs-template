import React from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
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

function Dashboard({headings, data}) {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  //console.log(allData.headings)

  return (
    <div>
      <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
          <Card>
          <CardHeader color="red">
            <h4 className={classes.cardTitleWhite}>D3 Visualizations</h4>
            <p className={classes.cardCategoryWhite}>
              Time to drive the work
            </p>
          </CardHeader>
          <CardBody>
              <MyD3Component data={[10,11,12]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Simple Table</h4>
            <p className={classes.cardCategoryWhite}>
              Here is a subtitle for this table
            </p>
          </CardHeader>
          <CardBody>
            <Table
                tableHeaderColor="primary"
                tableHead={headings}
                tableData={data}
            />
          </CardBody>
        </Card>
      </GridItem>

    </GridContainer>
    </div>
  );
}

//import {getTsvDataFromDisk} from "variables/tables.js";
//export async function getStaticProps() {
//  const allData = getTsvDataFromDisk()
//  return {
//    props: {
//      allData
//    }
//  }
//}

import {MyD3Component} from "../../components/D3/MyD3Component";
export async function getServerSideProps() {
  const res = await fetch(`http://10.0.0.184:5001/api/ALS/claims`)
  const allData = await res.json()
  const headings = Object.keys(allData[0])
  const data = allData.map(x => Object.values(x));
  //console.log()
  return { props: { 'headings': headings, 'data': data } }
}

Dashboard.layout = Admin;

export default Dashboard;
