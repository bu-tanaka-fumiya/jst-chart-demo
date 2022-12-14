import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  ChartData,
  ChartArea,
  Color,
  registerables,
} from "chart.js";
import { Chart } from "react-chartjs-2";
// styles
import "./index.scss";

ChartJS.register(...registerables);

type Props = {
  timeUnit: "hour" | "day" | "date" | "week" | "month";
  allLabels: string[];
  allDatasets: {
    label: string;
    data: number[];
    color: string;
    order: number;
  }[];
};

const POINT_HOVER_RADIUS = 5;
const POINT_HOVER_BORDER_WIDTH = 1.5;

const CHART_AREA_HEIGHT = 330;

const createGradient = (
  ctx: CanvasRenderingContext2D,
  area: ChartArea,
  baseColor: string
) => {
  const colorStart = `${baseColor}08`;
  const colorEnd = `${baseColor}80`;

  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);

  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);

  return gradient;
};

const ChartjsPolygonal: React.FC<Props> = memo(
  ({ timeUnit, allLabels, allDatasets }) => {
    const [frontChartIndex, setFrontChartIndex] = useState<number>(0);

    const chartRef = useRef<ChartJS>(null);

    const [chartData, setChartData] = useState<
      ChartData<"line", number[], string>
    >({
      labels: [],
      datasets: [],
    });

    const data: ChartData<"line", number[], string> = useMemo(() => {
      return {
        labels: allLabels,
        datasets: allDatasets.map((_allDataset, index) => ({
          label: _allDataset.label,
          data: _allDataset.data,
          borderColor: _allDataset.color,
          order: index === frontChartIndex ? 0 : 1,
        })),
      };
    }, [timeUnit, allLabels, allDatasets, frontChartIndex]);

    useEffect(() => {
      const chart = chartRef.current;

      if (!chart) {
        return;
      }

      const chartData = {
        ...data,
        datasets: data.datasets.map((dataset) => {
          const isFrontData = !dataset.order;
          return {
            ...dataset,
            pointBackgroundColor: isFrontData ? "#ffffff" : dataset.borderColor,
            // pointBackgroundColor: isFrontData ? "transparent" : `${dataset.borderColor}80`,
            fill: isFrontData ? true : false,
            backgroundColor: isFrontData
              ? createGradient(
                  chart.ctx,
                  chart.chartArea,
                  `${dataset.borderColor}`
                )
              : "transparent",
          };
        }),
      };

      setChartData(chartData);
    }, [data]);

    return (
      <>
        <div
          style={{
            height: 60,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div className="chartjsPolygonal__legend">
            {allDatasets.map(({ label, color }, index) => (
              <span className="chartjsPolygonal__legend__item" key={index}>
                <span
                  className="chartjsPolygonal__legend__item__color"
                  style={{ backgroundColor: color }}
                />
                <span className="chartjsPolygonal__legend__item__label">
                  {label}
                </span>
              </span>
            ))}
          </div>
          <div className="chartjsPolygonal__button">
            {allDatasets.map(({ label }, index) => (
              <button key={index} onClick={() => setFrontChartIndex(index)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: -60 }}>
          <Chart
            type="line"
            ref={chartRef}
            height={CHART_AREA_HEIGHT}
            options={{
              responsive: true,
              interaction: {
                intersect: false,
                mode: "point",
              },
              layout: {
                padding: { top: 80 },
              },
              maintainAspectRatio: false,
              datasets: {
                line: {
                  borderWidth: 1,
                  pointRadius: 1,
                  pointHitRadius:
                    (POINT_HOVER_RADIUS + POINT_HOVER_BORDER_WIDTH) * 1.5,
                  pointBorderWidth: 1,
                  pointBackgroundColor: "#ffffff",
                  pointHoverRadius: POINT_HOVER_RADIUS,
                  pointHoverBorderWidth: POINT_HOVER_BORDER_WIDTH,
                  pointHoverBackgroundColor: "#ffffff",
                  clip: 10,
                  borderJoinStyle: "bevel",
                },
              },
              scales: {
                y: {
                  min: 0,
                  grace: "10%",
                  grid: {
                    borderDash: [2, 2],
                    drawBorder: false,
                    drawTicks: false,
                  },
                  ticks: {
                    precision: 0,
                    padding: 10,
                  },
                },
                x: {
                  // offset: true,
                  grid: {
                    display: false,
                    drawTicks: false,
                    borderColor: "#858585",
                  },
                  ticks: {
                    autoSkipPadding: 10,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                // filler: {
                //   propagate: false
                // },
                tooltip: {
                  yAlign: "bottom",
                  animation: {
                    duration: 0,
                  },
                  displayColors: false,
                  backgroundColor: (ctx) => {
                    return (ctx.tooltipItems[0]?.dataset.borderColor ||
                      "transparent") as Color;
                  },
                  callbacks: {
                    title: (tooltipItems) => {
                      return tooltipItems[0]?.label;
                    },
                    label: (tooltipItem) => {
                      console.log(tooltipItem, tooltipItem.dataset.label || "");
                      // return tooltipItem.dataset.order && tooltipItem.dataset.label || ''
                      if (data.datasets.length > 1) {
                        const targetDatasets = data.datasets
                          .map((dataset, index) => ({
                            label: dataset.label,
                            datasetIndex: index,
                            data: dataset.data[tooltipItem.dataIndex],
                            order: dataset.order,
                          }))
                          .filter((dataset) => dataset.data === tooltipItem.raw)
                          .sort((a, b) => a.order - b.order);
                        console.log(targetDatasets);
                        if (targetDatasets.length > 1) {
                          if (
                            targetDatasets[0].datasetIndex ===
                            tooltipItem.datasetIndex
                          ) {
                            return tooltipItem.dataset.label || "";
                          }
                          return "";
                        }
                      }
                      return tooltipItem.dataset.label || "";
                    },
                    footer: (tooltipItems) => {
                      return tooltipItems[0]?.formattedValue;
                    },
                  },
                },
              },
            }}
            plugins={[
              {
                id: "drawBorder",
                afterDraw: (chart: {
                  tooltip?: any;
                  scales?: any;
                  ctx?: any;
                }) => {
                  if (chart.tooltip._active && chart.tooltip._active.length) {
                    const activePoint = chart.tooltip._active[0];
                    const { ctx } = chart;
                    const { x, y } = activePoint.element;
                    const topY =
                      y + POINT_HOVER_RADIUS + POINT_HOVER_BORDER_WIDTH;
                    const bottomY = chart.scales.y.bottom;

                    if (topY < bottomY) {
                      ctx.save();
                      ctx.beginPath();
                      ctx.setLineDash([2, 2]);
                      ctx.moveTo(x, topY);
                      ctx.lineTo(x, bottomY);
                      ctx.lineWidth = 1;
                      ctx.strokeStyle =
                        chart.tooltip.labelColors[0]?.borderColor ||
                        "transparent";
                      ctx.stroke();
                      ctx.restore();
                    }
                  }
                },
              },
            ]}
            data={chartData}
          />
        </div>
      </>
    );
  }
);

export default ChartjsPolygonal;
