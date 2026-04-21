function mountNewUsersChart(container, data) {
  window.chartUtils.renderDualLineChart(container, {
    title: "Cumulative New Users",
    labels: data.labels,
    series: [
      { label: "Cumulative New Users", color: "#2268ff", values: data.cumulative },
    ],
  });
}

window.mountNewUsersChart = mountNewUsersChart;
