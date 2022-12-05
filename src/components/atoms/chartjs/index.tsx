import React, { memo, useMemo } from "react";
import { Chart as ChartJS, Color, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
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

const POINT_HOVER_RADIUS = 3;

const ChartjsPolygonal: React.FC<Props> = memo(
  ({ timeUnit, allLabels, allDatasets }) => {
    // const data = useMemo(() => {
    //   const labels: string[] = []
    //   const datasets = allDatasets.map(_allDataset => ({
    //     label: _allDataset.label,
    //     data: [] as number[],
    //     borderColor: _allDataset.color,
    //     backgroundColor: _allDataset.color,
    //     order: _allDataset.order
    //   }))
    //   allLabels.forEach((label, index) => {
    //     let currentLabel = ''
    //     if (timeUnit === 'month') {
    //       currentLabel = dayjs(label).format('YYYY/MM')
    //     } else if (timeUnit === 'week') {
    //       currentLabel = `${dayjs(label).format('YYYY/MM')} 第${Math.ceil((dayjs(label).date() + 1) / 7)}週`
    //     } else if (timeUnit === 'date') {
    //       currentLabel = dayjs(label).format('YYYY/MM/DD')
    //     } else if (timeUnit === 'day') {
    //       currentLabel = dayjs(label).format('YYYY/MM/DD')
    //     } else {
    //       currentLabel = dayjs(label).format('YYYY/MM/DD HH:mm:ss')
    //     }
    //     if (labels[labels.length - 1] === currentLabel) {
    //       for (let i = 0; i < datasets.length && i < allDatasets.length; i++) {
    //         datasets[i].data[datasets[i].data.length - 1] += allDatasets[i].data[index]
    //       }
    //     }
    //     else {
    //       labels.push(currentLabel)
    //       for (let i = 0; i < datasets.length && i < allDatasets.length; i++) {
    //         datasets[i].data.push(allDatasets[i].data[index])
    //       }
    //     }
    //   })
    //   return {
    //     labels,
    //     datasets
    //   };
    // }, [timeUnit, allDatasets])

    const data = useMemo(() => {
      return {
        labels: allLabels,
        datasets: allDatasets.map((_allDataset) => ({
          label: _allDataset.label,
          data: _allDataset.data,
          borderColor: _allDataset.color,
          backgroundColor: _allDataset.color,
          order: _allDataset.order,
        })),
      };
    }, [timeUnit, allLabels, allDatasets]);

    return (
      <>
        <div className="chartjsPolygonal__legend" style={{ height: 60 }}>
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
        <div style={{ marginTop: -60 }}>
          <Line
            height={330}
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
                  pointBorderWidth: 1,
                  pointBackgroundColor: "#ffffff",
                  pointHoverRadius: POINT_HOVER_RADIUS,
                  pointHoverBackgroundColor: "#ffffff",
                  clip: 10,
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
                    const { x } = activePoint.element;
                    const topY = chart.tooltip.caretY + POINT_HOVER_RADIUS;
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
            data={data}
          />
        </div>
      </>
    );
  }
);

export default ChartjsPolygonal;
