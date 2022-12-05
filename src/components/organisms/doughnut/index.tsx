import React, { memo, useMemo, useState } from "react";

// components
import ChartjsDoughnut from "../../atoms/chartjs1";
import RechartsDoughnut from "../../atoms/recharts1";

// styles
import "./index.scss";

/*

- 円
https://docs.google.com/presentation/d/1Ya0JbVkmJigWSELH-VKSDdAfTqxg4Xbb/edit#slide=id.p23

*/

/*
1. react-chart-js2
2. rechartjs
*/

const getData = () =>
  Array.from({ length: Math.floor(Math.round(Math.random()) + 2) })
    .map((_) => Math.ceil(Math.random() * (100 - 10) + 10))
    .sort((a, b) => b - a);

const DoughnutDemo: React.FC = memo(() => {
  const [data, setData] = useState<number[]>(getData());

  const doughnutProps = useMemo(() => {
    return {
      data: data.map((value, index) => ({
        label: `Data ${index + 1}`,
        value,
        color: ["#1f78b4", "#a6cee3", "#b2df8a"][index],
      })),
    };
  }, [data]);

  return (
    <div className="doughnut">
      <h1>円グラフ</h1>
      {/* <div>
        <button onClick={() => setData([])}>空</button>
        <button onClick={() => setData(getData())}>ランダム</button>
      </div> */}
      <div className="doughnut__chart">
        <div className="doughnut__chart--1">
          <ChartjsDoughnut {...doughnutProps} />
        </div>
        <div className="doughnut__chart--2">
          <RechartsDoughnut {...doughnutProps} />
        </div>
      </div>
    </div>
  );
});

export default DoughnutDemo;
