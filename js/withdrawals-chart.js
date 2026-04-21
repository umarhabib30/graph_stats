function mountWithdrawalsChart(container, data) {
  window.chartUtils.renderDualLineChart(container, {
    title: "Withdrawals and Users",
    labels: data.labels,
    series: [
      { label: "Withdrawal Amount", color: "#d85a63", values: data.amounts },
      { label: "Users Withdrew", color: "#2268ff", values: data.users },
    ],
  });
}

window.mountWithdrawalsChart = mountWithdrawalsChart;
