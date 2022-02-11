import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from 'react';
import {useSelector} from "react-redux";

export default function PaperTimeHistogram() {
  const headerRef = useRef();

  const { data, pending, error } = useSelector((state) => state.corpus);

  useEffect(() => {
    if (data.paperHistogram === undefined) return;
    const chart = Plot.plot({
      marginBottom: 80,
      x: {
        tickRotate: -90,
        label: null
      },
      y: {
        grid: true,
        label: "↑ Paper Count"
      },
      marks: [
        Plot.rectY(data.paperHistogram, {x: "date", interval:d3.timeYear, y: "paper_count" }),
        Plot.ruleY([0])
      ]
    })
    headerRef.current.append(chart);
    return () => chart.remove();
  }, [data.paperHistogram]);

  return (
    <div className="PaperTimeHistogram">
      <header className="App-header" ref={headerRef}>
      </header>
    </div>
  );
}
