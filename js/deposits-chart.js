function mountDepositsChart(container, data) {
  window.chartUtils.renderDualLineChart(container, {
    title: "Deposits and Users",
    labels: data.labels,
    series: [
      { label: "Deposit Amount", color: "#23b26d", values: data.amounts },
      { label: "Users Deposited", color: "#2268ff", values: data.users },
    ],
  });
}

window.mountDepositsChart = mountDepositsChart;
