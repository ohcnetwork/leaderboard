"use client";

import React from "react";
import { AxisOptions, Chart } from "react-charts";

type Data = {
  month: number;
  year: number;
  newContributors: number;
};

export default function PeopleJoinOrgChart(props: { data: Data[] }) {
  const data = [
    {
      label: "First contribution",
      data: props.data,
    },
  ];

  const primaryAxis = React.useMemo(
    (): AxisOptions<Data> => ({
      getValue: (datum) => `${datum.year}/${datum.month}`,
    }),
    [],
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<Data>[] => [
      {
        getValue: (datum) => datum.newContributors,
      },
    ],
    [],
  );

  return (
    <Chart
      className="h-full w-full"
      style={{
        width: 512,
        height: 100,
      }}
      options={{ data, primaryAxis, secondaryAxes }}
    />
  );
}
