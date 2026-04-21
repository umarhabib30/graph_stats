function mountNewUsersChart(container, data) {
  window.chartUtils.renderLineAreaChart(container, {
    title: "New users cumulative chart",
    seriesLabel: "Cumulative New Users",
    labels: data.labels,
    values: data.cumulative,
    yTickStep: 25,
    lineColor: "#2268ff",
    fillColor: "rgba(34, 104, 255, 0.14)",
  });
}

window.mountNewUsersChart = mountNewUsersChart;
