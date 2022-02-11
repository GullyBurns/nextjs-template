import {React, useState, useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {getCorpusList, setAuthorPage, selectCorpusId, getAuthorList} from "../../features/corpus";
import {wrapper} from "../../app/store";

import { makeStyles } from "@material-ui/core/styles";
import Admin from "layouts/Admin.js";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import styles from "assets/jss/nextjs-material-dashboard/views/dashboardStyle.js";

import {Sparklines, SparklinesLine, SparklinesSpots} from "react-sparklines";
import PaperTimeHistogram from "../../components/D3/PaperTimeHistogram";
import AuthorTable from "../../components/Table/AuthorTable";
import ConceptTable from "../../components/Table/ConceptTable";
import PaperTable from "../../components/Table/PaperTable";

function CorpusDashboard() {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const dispatch = useDispatch();
  const { data, pending, error } = useSelector((state) => state.corpus);

  return (
      <div>
    {error && <p>Oops, something went wrong</p>}
    {data.corpusId>-1 && <div>
      <GridContainer>
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
            <h4 className={classes.cardTitleWhite}>Concepts</h4>
            <p className={classes.cardCategoryWhite}>
              Table of Concepts + Counts in Corpus
            </p>
          </CardHeader>
          <CardBody>
              <ConceptTable/>
          </CardBody>
        </Card>
      </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
            <Card>
            <CardHeader color="danger">
              <h4 className={classes.cardTitleWhite}>Author List</h4>
              <p className={classes.cardCategoryWhite}>
                Tabulate Authors.
              </p>
            </CardHeader>
            <CardBody>
              <AuthorTable/>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
            <Card>
            <CardHeader color="danger">
              <h4 className={classes.cardTitleWhite}>Paper List</h4>
              <p className={classes.cardCategoryWhite}>
                Table of Papers in corpus.
              </p>
            </CardHeader>
            <CardBody>
              <PaperTable/>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>}
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
