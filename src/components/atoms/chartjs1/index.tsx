import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Chart } from "react-chartjs-2";
// styles
import "./index.scss";

ChartJS.register(...registerables);

type Props = {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
};

const SIZE = 220;
const RADIUS_OUTER = 103;
const RADIUS_INNER = 61;

const ChartjsDoughnut: React.FC<Props> = memo(({ data }) => {
  const ref = useRef<ChartJS>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);
  const [isHover, setIsHover] = useState<boolean>(false)

  const { isEmpty, values, labels, colors, percentages } = useMemo(() => {
    const all = data.reduce((prev, curr) => prev + curr.value, 0);
    const isEmpty = data.length === 0;
    return {
      isEmpty,
      labels: data.map(({ label }) => label),
      values: data.map(({ value }) => value),
      colors: data.map(({ color }) => color),
      percentages: !isEmpty
        ? data.map(({ value }) => {
            const percentageValue = (value / all) * 100;
            if (percentageValue < 0.1) {
              return 0.1;
            } else {
              return (Math.round(percentageValue * 1000) / 1000).toFixed(1);
            }
          })
        : undefined,
    };
  }, [data]);

  useEffect(() => {
    if (ref.current) {
      ref.current.clear();
      ref.current.update();
    }
  }, [data])

  useEffect(() => {
    if (hoverIndex !== undefined && !isHover) {
      setActiveIndex(0);
      setHoverIndex(undefined);
    } 
    // console.log(isHover)
  }, [isHover])

  return (
    <div className={`chartjsDoughnut ${!isEmpty ? "chartjsDoughnut--active" : ""}`}>
      <div className="chartjsDoughnut__title">react-chartjs-2</div>
      <div
        className={`chartjsDoughnut__chart ${
          hoverIndex !== undefined && !isEmpty ? "chartjsDoughnut__chart--hover" : ""
        }`}
      >
        <Chart
          type="doughnut"
          height={SIZE}
          width={SIZE}
          // redraw={true}
          ref={ref}
          data={{
            labels: labels,
            datasets: [
              {
                borderWidth: 2,
                borderColor: "#ffffff",
                // borderAlign: 'inner',
                // borderColor: ["#ffffff", '#000000', '#666666'],
                // borderAlign: (ctx, options) => {
                //     return ctx.dataIndex === hoverIndex ? 'center' : 'inner'
                // },
                weight: 1,
                ...(!isEmpty ? {
                  data: values,
                  backgroundColor: colors,
                  hoverBorderWidth: 8,
                  hoverBorderColor: (ctx) => {
                    return Array.isArray(ctx.dataset.backgroundColor)
                      ? `${ctx.dataset.backgroundColor[ctx.dataIndex]}4D`
                      : "transparent";
                  },
                  hoverBackgroundColor: (ctx) => {
                    return !isEmpty && Array.isArray(ctx.dataset.backgroundColor)
                      ? `${ctx.dataset.backgroundColor[ctx.dataIndex]}`
                      : "transparent";
                  },
                } : {
                  data: [1],
                  backgroundColor: ["#727272"],
                })
              }
            ],
          }}
          options={{
            layout: {
              padding: 7,
            },
            radius: RADIUS_OUTER,
            cutout: (RADIUS_INNER / RADIUS_OUTER) * 100,
            onHover: (event, elements, chart) => {
              // console.log(event, elements, chart, elements[0], {
              //   activeIndex: elements[0]?.index || 0,
              //   hoverIndex: elements[0] ? elements[0].index : undefined,
              // })
              setActiveIndex(elements[0]?.index || 0);
              setHoverIndex(elements[0] ? elements[0].index : undefined);
            },
            datasets: {
              doughnut: {},
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: false,
              },
            },
          }}
          plugins={[{
            id: 'customEventListner',
            afterEvent: (chart, evt, opts) => {
              // console.log(evt.event.type, evt.event.x, evt.event.y, Math.sqrt((SIZE / 2 - evt.event.x) ** 2 + (SIZE / 2 - evt.event.y) ** 2), RADIUS_OUTER)
              if (typeof evt.event.x === 'number' && typeof evt.event.y === 'number') {
                // setActiveIndex(0);
                // setHoverIndex(undefined);
                setIsHover(Math.sqrt((SIZE / 2 - evt.event.x) ** 2 + (SIZE / 2 - evt.event.y) ** 2) >= RADIUS_INNER && Math.sqrt((SIZE / 2 - evt.event.x) ** 2 + (SIZE / 2 - evt.event.y) ** 2) <= RADIUS_OUTER)
              }
            }
          }]}
        />
        <div className="chartjsDoughnut__chart__label">
          {percentages ? (
            <>
              <p className="chartjsDoughnut__chart__label__name">
                {labels[activeIndex]}
              </p>
              <p className="chartjsDoughnut__chart__label__percentage">
                <span className="chartjsDoughnut__chart__label__percentage__value">
                  {percentages[activeIndex]}
                </span>
                <span className="chartjsDoughnut__chart__label__percentage__unit">
                  %
                </span>
              </p>
            </>
          ) : (
            <p className="chartjsDoughnut__chart__label__nodata">No Data</p>
          )}
        </div>
      </div>
      {percentages && (
        <div className="chartjsDoughnut__legend">
          {labels.map((label, index) => (
            <p
              key={index}
              className="chartjsDoughnut__legend__item"
              style={{
                backgroundColor:
                  activeIndex === index ? `${colors[index]}26` : "transparent",
              }}
            >
              <span
                className="chartjsDoughnut__legend__item__color"
                style={{
                  backgroundColor: colors[index],
                }}
              ></span>
              <span className="chartjsDoughnut__legend__item__name">
                {label}
              </span>
              <span className="chartjsDoughnut__legend__item__percentage">
                <span className="chartjsDoughnut__legend__item__percentage__value">
                  {percentages[index]}
                </span>
                <span className="chartjsDoughnut__legend__item__percentage__unit">
                  %
                </span>
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

export default ChartjsDoughnut;
// width 42px
