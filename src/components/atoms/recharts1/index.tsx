import React, { memo, useMemo, useState } from "react";
import { PieChart, Pie, Sector } from "recharts";
// styles
import "./index.scss";

// const renderActiveShape = (props) => {
//   const RADIAN = Math.PI / 180;
//   const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, midAngle } =
//     props;
//   const sin = Math.sin(-RADIAN * midAngle);
//   const cos = Math.cos(-RADIAN * midAngle);
//   const sx = cx + (outerRadius - 40) * cos;
//   const sy = cy + (outerRadius - 40) * sin;
//   return (
//     <Sector
//       cx={sx}
//       cy={sy}
//       innerRadius={innerRadius}
//       outerRadius={outerRadius}
//       startAngle={startAngle}
//       endAngle={endAngle}
//       fill="red"
//     />
//   );
// };

type Props = {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
};

const RechartsDoughnut: React.FC<Props> = memo(({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);

  const { isEmpty, labels, colors, percentages } = useMemo(() => {
    const all = data.reduce((prev, curr) => prev + curr.value, 0);
    const isEmpty = data.length === 0;
    return {
      isEmpty,
      labels: data.map(({ label }) => label),
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

  return (
    <div
      className={`rechartsDoughnut ${
        !isEmpty ? "rechartsDoughnut--active" : ""
      }`}
    >
      <div className="rechartsDoughnut__title">recharts</div>
      <div
        className={`rechartsDoughnut__chart ${
          hoverIndex !== undefined ? "rechartsDoughnut__chart--hover" : ""
        }`}
      >
        <PieChart
          width={220}
          height={220}
          margin={{ top: 7, right: 7, bottom: 7, left: 7 }}
        >
          <Pie
            data={
              data.length
                ? data.map(({ label, value, color }) => ({
                    name: label,
                    value,
                    fill: color,
                  }))
                : [
                    {
                      name: "",
                      value: 1,
                      fill: "#727272",
                    },
                  ]
            }
            cx="50%"
            cy="50%"
            paddingAngle={1}
            innerRadius={61}
            outerRadius={103}
            startAngle={90}
            endAngle={-270}
            // activeShape={renderActiveShape}
            // fill="#8884d8"
            // paddingAngle={0}
            dataKey="value"
            animationBegin={0}
            animationDuration={600}
            onMouseEnter={(data, index, event) => {
              console.log(data, index, event);
              setActiveIndex(index);
              setHoverIndex(index);
            }}
            onMouseLeave={(data, index, event) => {
              console.log(data, index, event);
              setActiveIndex(0);
              setHoverIndex(undefined);
            }}
          ></Pie>
        </PieChart>

        <div className="rechartsDoughnut__chart__label">
          {percentages ? (
            <>
              <p className="rechartsDoughnut__chart__label__name">
                {labels[activeIndex]}
              </p>
              <p className="rechartsDoughnut__chart__label__percentage">
                <span className="rechartsDoughnut__chart__label__percentage__value">
                  {percentages[activeIndex]}
                </span>
                <span className="rechartsDoughnut__chart__label__percentage__unit">
                  %
                </span>
              </p>
            </>
          ) : (
            <p className="rechartsDoughnut__chart__label__nodata">No Data</p>
          )}
        </div>
      </div>
      {percentages && (
        <div className="rechartsDoughnut__legend">
          {labels.map((label, index) => (
            <p
              key={index}
              className="rechartsDoughnut__legend__item"
              style={{
                backgroundColor:
                  activeIndex === index ? `${colors[index]}26` : "transparent",
              }}
            >
              <span
                className="rechartsDoughnut__legend__item__color"
                style={{
                  backgroundColor: colors[index],
                }}
              ></span>
              <span className="rechartsDoughnut__legend__item__name">
                {label}
              </span>
              <span className="rechartsDoughnut__legend__item__percentage">
                <span className="rechartsDoughnut__legend__item__percentage__value">
                  {percentages[index]}
                </span>
                <span className="rechartsDoughnut__legend__item__percentage__unit">
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

export default RechartsDoughnut;
