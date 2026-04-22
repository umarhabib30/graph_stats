function mountTradingVolumeChart(container, data) {
  window.chartUtils.renderFlatComparisonChart(container, {
    title: "Trading volume chart",
    labels: data.labels,
    series: [
      { label: "Referral's Volume", color: "#64d98a", values: data.referralDaily },
      { label: "Sub Team's Volume", color: "#5a88ff", values: data.subDaily },
    ],
    yFormatter: (value) => `${value}M`,
  });
}

window.mountTradingVolumeChart = mountTradingVolumeChart;
