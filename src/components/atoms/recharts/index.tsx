import React, { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';

type Props = {
  timeUnit: 'hour'|'day'|'date'|'week'|'month',
  allLabels: string[],
  allDatasets: {
    label: string,
    data: number[],
    color: string
  }[]
}

const RechartsPolygonal: React.FC<Props> = memo(({ timeUnit, allLabels, allDatasets }) => {
  // const data = useMemo(() => {
  //   const labels: string[] = []
  //   const datas: number[][] = []
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

  const data = useMemo(() => {
    const labels = allLabels
    const datas: number[][] = allDatasets.map(({data}) => data)
    // allLabels.forEach((label, index) => {
    //   let currentLabel = ''
    //   if (timeUnit === 'month') {
    //     currentLabel = dayjs(label).format('YYYY/MM')
    //   } else if (timeUnit === 'week') {
    //     currentLabel = `${dayjs(label).format('YYYY/MM')} 第${Math.ceil((dayjs(label).date() + 1) / 7)}週`
    //   } else if (timeUnit === 'date') {
    //     currentLabel = dayjs(label).format('YYYY/MM/DD')
    //   } else if (timeUnit === 'day') {
    //     currentLabel = dayjs(label).format('YYYY/MM/DD')
    //   } else {
    //     currentLabel = dayjs(label).format('YYYY/MM/DD HH:mm:ss')
    //   }
    //   if (labels[labels.length - 1] === currentLabel) {
    //     for (let i = 0; i < datas[datas.length - 1].length && i < allDatasets.length; i++) {
    //       datas[datas.length - 1][i] += allDatasets[i].data[index]
    //     }
    //   }
    //   else {
    //     labels.push(currentLabel)
    //     datas.push(allDatasets.map(allDataset => allDataset.data[index]))
    //   }
    // })

    return labels.map((label, index) => ({
      name: label,
      ...(datas.reduce((p, c, i) => {
        return {
          ...p,
          [`data${i+1}`]: c[index],
        }
      }, {}))
    }))
  }, [timeUnit, allLabels, allDatasets])

  return (
    <ResponsiveContainer width="100%" height={300}>  
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis axisLine={false} />
        <Tooltip />
        {allDatasets.map((allDataset, index) => (
          <Line
            key={index}
            type="linear"
            dataKey={`data${index+1}`}
            name={allDataset.label}
            dot={{ r: 1 }}
            activeDot={{ r: 3, stroke: allDataset.color, strokeWidth: 1, fill: "#ffffff" }}
            stroke={allDataset.color}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
});

export default RechartsPolygonal;
