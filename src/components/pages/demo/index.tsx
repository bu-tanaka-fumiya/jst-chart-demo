import React, { memo, useEffect, useState } from "react";

// components
import PolygonalDemo from "../../organisms/polygonal";
import DoughnutDemo from "../../organisms/doughnut";

// styles
import "./index.scss";

/*

- 折れ線
https://docs.google.com/presentation/d/1Ya0JbVkmJigWSELH-VKSDdAfTqxg4Xbb/edit#slide=id.p23
- 円
https://docs.google.com/presentation/d/1Ya0JbVkmJigWSELH-VKSDdAfTqxg4Xbb/edit#slide=id.p23
- 

*/

type ChartType = "polygonal" | "doughnut" | undefined;

const URL_SEARCH_PARAMS_NAME = "chart";

const getTypeFromURL: () => ChartType = () =>
  (new URLSearchParams(location.search).get(URL_SEARCH_PARAMS_NAME) ||
    undefined) as ChartType;

const DemoPage: React.FC = memo(() => {
  const [chartType, setChartType] = useState<ChartType>(getTypeFromURL());

  useEffect(() => {
    history.replaceState(
      null,
      null,
      `?${URL_SEARCH_PARAMS_NAME}=${chartType || "polygonal"}`
    );
  }, [chartType]);

  return (
    <div className="demo">
      {/* <div>
        <button
          onClick={() =>
            setChartType(chartType === "doughnut" ? "polygonal" : "doughnut")
          }
        >
          {chartType === "doughnut" ? "折れ線グラフ" : "円グラフ"}
        </button>
      </div> */}
      {chartType === "doughnut" ? (
        <div className="demo__doughnut">
          <DoughnutDemo />
        </div>
      ) : (
        <div className="demo__polygonal">
          <PolygonalDemo />
        </div>
      )}
    </div>
  );
});

export default DemoPage;
