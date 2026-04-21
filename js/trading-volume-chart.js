function mountTradingVolumeChart(container, data) {
  window.chartUtils.renderVolumeChart(container, {
    labels: data.labels,
    values: data.values,
    barColor: "#f2a33a",
    lineColor: "#2268ff",
  });
}

window.mountTradingVolumeChart = mountTradingVolumeChart;
