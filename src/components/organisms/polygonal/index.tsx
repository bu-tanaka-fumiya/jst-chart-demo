import React, { memo, useMemo, useState } from "react";
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

// components
import RechartsPolygonal from "../../atoms/recharts";
import ChartjsPolygonal from "../../atoms/chartjs";

// styles
import "./index.scss";

/*

- 折れ線
https://docs.google.com/presentation/d/1Ya0JbVkmJigWSELH-VKSDdAfTqxg4Xbb/edit#slide=id.p23

*/

/*
1. react-chart-js2
2. rechartjs
*/

// const DURATION_FROM = "2020-01-01 00:00:00";
const DURATION_FROM = "2021-11-01 00:00:00";
const DURATION_TO = "2021-12-31 23:59:59";

const WEEK_BEGINNING_DAY = 0;

const getAllData = (range: { min: number; max: number }) =>
  faker.date
    .betweens(DURATION_FROM, DURATION_TO, faker.datatype.number(range))
    .map((date) => ({
      date,
      value: 1,
    }));

const getFormatedData = (
  datalists: { date: Date; value: number }[][],
  timeUnit: "hour" | "day" | "date" | "week" | "month"
) => {
  const labels: string[] = [];
  const datas: number[][] = Array(datalists.length)
    .fill(null)
    .map((_) => []);

  if (timeUnit === "day") {
    labels.push(...["日", "月", "火", "水", "木", "金", "土"]);
    datalists.forEach((datalist, index) => {
      datas[index].push(...Array(7).fill(0));
      datalist.forEach((data) => {
        datas[index][dayjs(data.date).day()] += data.value;
      });
    });
  } else if (timeUnit === "hour") {
    labels.push(
      ...Array(24)
        .fill(null)
        .map((_, index) => `${index}`)
    );
    datalists.forEach((datalist, index) => {
      datas[index].push(...Array(24).fill(0));
      datalist.forEach((data) => {
        datas[index][dayjs(data.date).hour()] += data.value;
      });
    });
  } else if (timeUnit === "week") {
    const minDate = dayjs(DURATION_FROM).startOf("date");
    const maxDate = dayjs(DURATION_TO).endOf("date");
    let currentDurationFromDate = minDate;

    while (currentDurationFromDate.isBefore(maxDate)) {
      labels.push(
        currentDurationFromDate.format(
          `YYYY/MM 第${
            currentDurationFromDate.day() !== WEEK_BEGINNING_DAY ||
            currentDurationFromDate.date() === 1
              ? 1
              : Math.ceil(currentDurationFromDate.date() / 7) + 1
          }週`
        )
      );
      const currentWeekEndDate = currentDurationFromDate
        .add(
          (WEEK_BEGINNING_DAY + 6 - currentDurationFromDate.day()) % 7,
          "day"
        )
        .endOf("date");
      const currentMonthEndDate = currentDurationFromDate.endOf("month");
      const currentDurationToDate = currentMonthEndDate.isBefore(
        currentWeekEndDate
      )
        ? currentMonthEndDate
        : currentWeekEndDate;

      datalists.forEach((datalist, index) => {
        datas[index].push(
          datalist
            .filter(
              ({ date }) =>
                !dayjs(date).isBefore(currentDurationFromDate) &&
                !dayjs(date).isAfter(currentDurationToDate)
            )
            .reduce((prev, curr) => prev + curr.value, 0)
        );
      });

      currentDurationFromDate = currentDurationToDate
        .add(1, "second")
        .startOf("date");
    }
  } else {
    const formatTemplate = `YYYY/MM${timeUnit !== "month" ? `/DD` : ""}`;
    const minDate = dayjs(DURATION_FROM).startOf(timeUnit);
    const maxDate = dayjs(DURATION_TO).endOf(timeUnit);
    let currentDurationFromDate = minDate;

    while (currentDurationFromDate.isBefore(maxDate)) {
      labels.push(currentDurationFromDate.format(formatTemplate));
      const currentDurationToDate = currentDurationFromDate.endOf(timeUnit);

      datalists.forEach((datalist, index) => {
        datas[index].push(
          datalist
            .filter(
              ({ date }) =>
                !dayjs(date).isBefore(currentDurationFromDate) &&
                !dayjs(date).isAfter(currentDurationToDate)
            )
            .reduce((prev, curr) => prev + curr.value, 0)
        );
      });

      currentDurationFromDate = currentDurationToDate
        .add(1, "second")
        .startOf(timeUnit);
    }
  }

  return { labels, datas };
};

const PolygonalDemo: React.FC = memo(() => {
  const [allDatas, setAllDatas] = useState([
    getAllData({ min: 150, max: 300 }),
    getAllData({ min: 10, max: 20 }),
  ]);

  const [timeUnit, setTimeUnit] = useState<
    "hour" | "day" | "date" | "week" | "month"
  >("date");
  const [frontChartIndex, setFrontChartIndex] = useState<number>(0);

  const polygonalProps = useMemo(() => {
    const { labels, datas } = getFormatedData(allDatas, timeUnit);
    const allDatasets = [
      {
        label: "Dataset 1",
        data: datas[0],
        color: "#015cfa",
      },
      {
        label: "Dataset 2",
        data: datas[1],
        color: "#e53935",
      },
    ].map((allDataset, index) => ({
      ...allDataset,
      order: index === frontChartIndex ? 0 : 1,
    }));

    return {
      timeUnit,
      allLabels: labels,
      allDatasets,
    };
  }, [timeUnit, frontChartIndex]);

  // const data = useMemo(() => {
  //   const labels: string[] = []
  //   const datas: number[][] = []

  //   const minDate = dayjs(DURATION_FROM).format('YYYY/MM/DD 00:00:00')
  //   const maxDate = dayjs(DURATION_TO).format('YYYY/MM/DD 23:59:59')

  //   let currentDate = minDate

  //   while (dayjs(currentDate).isBefore(maxDate)) {
  //     currentDate = dayjs(minDate)

  //     if () {

  //     }
  //   }

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
  //       for (let i = 0; i < datas[datas.length - 1].length && i < allDatasets.length; i++) {
  //         datas[datas.length - 1][i] += allDatasets[i].data[index]
  //       }
  //     }
  //     else {
  //       labels.push(currentLabel)
  //       datas.push(allDatasets.map(allDataset => allDataset.data[index]))
  //     }
  //   })

  //   return labels.map((label, index) => ({
  //     name: label,
  //     ...(datas[index].reduce((p, c, i) => {
  //       return {
  //         ...p,
  //         [`data${i+1}`]: c,
  //       }
  //     }, {}))
  //   }))
  // }, [timeUnit, allLabels, allDatasets])

  return (
    <div className="polygonal">
      <div className="polygonal__header">
        <h1>折れ線グラフ</h1>
        <div>
          <button onClick={() => setTimeUnit("hour")}>時間</button>
          <button onClick={() => setTimeUnit("day")}>曜日</button>
          <button onClick={() => setTimeUnit("date")}>日</button>
          <button onClick={() => setTimeUnit("week")}>週</button>
          <button onClick={() => setTimeUnit("month")}>月</button>
        </div>
      </div>
      <div className="polygonal__chart">
        <div className="polygonal__chart--1">
          <h2>react-chartjs-2</h2>
          <ChartjsPolygonal {...polygonalProps} />
        </div>
        <div className="polygonal__chart--2">
          <h2>recharts</h2>
          <RechartsPolygonal {...polygonalProps} />
        </div>
      </div>
    </div>
  );
});

export default PolygonalDemo;
