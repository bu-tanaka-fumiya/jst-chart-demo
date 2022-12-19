import React, { memo, useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  ChartData,
  ChartArea,
  Color,
  registerables,
  Interaction,
  InteractionItem,
} from "chart.js";
import { getRelativePosition } from "chart.js/helpers";
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

const POINT_RADIUS = 1;
const POINT_BORDER_WIDTH = 1;
const POINT_HOVER_RADIUS = 5;
const POINT_HOVER_BORDER_WIDTH = 1.5;
const POINT_HIT_RADIUS = POINT_HOVER_RADIUS + POINT_HOVER_BORDER_WIDTH;

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

declare module "chart.js" {
  interface InteractionModeMap {
    customPointMode: InteractionModeFunction;
  }
}

const ChartjsPolygonal: React.FC<Props> = memo(
  ({ timeUnit, allLabels, allDatasets }) => {
    const [frontChartIndex, setFrontChartIndex] = useState<number>(0);
    const [data, setData] = useState<ChartData<"line", number[], string>>({
      labels: [],
      datasets: [],
    });
    const chartRef = useRef<ChartJS>(null);

    useEffect(() => {
      const chart = chartRef.current;

      setData({
        labels: allLabels,
        datasets: [
          ...allDatasets.map((_allDataset, index) => ({
            label: _allDataset.label,
            data: _allDataset.data,
            borderColor: _allDataset.color,
            pointBorderColor: _allDataset.color,
            pointHoverBorderColor: _allDataset.color,
            order: index === frontChartIndex ? 0 : 1,
            borderWidth: POINT_RADIUS,
            pointRadius: POINT_BORDER_WIDTH,
            pointHitRadius: POINT_HIT_RADIUS,
            pointHoverRadius: POINT_HOVER_RADIUS,
            pointHoverBorderWidth: POINT_HOVER_BORDER_WIDTH,
            pointHoverBackgroundColor: "#ffffff",
            fill: true,
            ...(chart && index === frontChartIndex
              ? {
                  pointBackgroundColor: "#ffffff",
                  backgroundColor: createGradient(
                    chart.ctx,
                    chart.chartArea,
                    `${_allDataset.color}`
                  ),
                }
              : {
                  pointBackgroundColor: _allDataset.color,
                  backgroundColor: "transparent",
                }),
          })),
        ],
      });
    }, [timeUnit, allLabels, allDatasets, frontChartIndex]);

    useEffect(() => {
      Interaction.modes.customPointMode = (
        chart,
        event,
        options,
        useFinalPosition
      ) => {
        const position = getRelativePosition(event, chart);
        const items: InteractionItem[] = [];

        Interaction.evaluateInteractionItems(
          chart,
          "xy",
          position,
          (element, datasetIndex, index) => {
            if (
              element.inXRange(position.x, useFinalPosition) &&
              element.inYRange(position.y, useFinalPosition)
            ) {
              items.push({ element, datasetIndex, index });
            }
          }
        );

        if (items.length > 1) {
          let nearestItems: InteractionItem[] = [];
          let nearestDistance: number = Math.sqrt(
            (items[0].element.x - position.x) ** 2 +
              (items[0].element.y - position.y) ** 2
          );

          items.forEach((item) => {
            const currentDistance = Math.sqrt(
              (item.element.x - position.x) ** 2 +
                (item.element.y - position.y) ** 2
            );
            if (nearestDistance > currentDistance) {
              nearestItems = [item];
            } else if (nearestDistance === currentDistance) {
              nearestItems.push(item);
            }
          });

          if (nearestItems.length > 1) {
            return [
              nearestItems.sort(
                (a, b) =>
                  (data.datasets[a.datasetIndex].order || 1) -
                  (data.datasets[b.datasetIndex].order || 1)
              )[0],
            ];
          }

          return nearestItems;
        } else {
          return items;
        }
      };
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
                intersect: true,
                mode: "customPointMode",
              },
              layout: {
                padding: { top: 80 },
              },
              maintainAspectRatio: false,
              datasets: {
                line: {
                  pointBorderWidth: 1,
                  pointBackgroundColor: "#ffffff",
                  clip: 10,
                  borderJoinStyle: "bevel",
                },
              },
              scales: {
                y: {
                  min: 0,
                  grace: "10%",
                  offset: true,
                  beginAtZero: true,
                  grid: {
                    borderDash: (ctx) => {
                      if (!ctx.index) {
                        return undefined;
                      }
                      return [2, 2];
                    },
                    color: (ctx) => {
                      if (!ctx.index) {
                        return "#858585";
                      }
                      return "#e0e0e0";
                    },
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
                    drawBorder: false,
                    borderColor: "#858585",
                  },
                  ticks: {
                    autoSkipPadding: 10,
                  },
                },
              },
              plugins: {
                filler: {
                  drawTime: "beforeDatasetsDraw",
                },
                legend: {
                  display: false,
                },
                tooltip: {
                  mode: "customPointMode",
                  yAlign: "bottom",
                  animation: {
                    duration: 0,
                  },
                  position: "nearest",
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
                    const bottomY = chart.scales.y._gridLineItems[0].ty1;

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
            data={data}
          />
        </div>
      </>
    );
  }
);

export default ChartjsPolygonal;
