function mountWithdrawalsChart(container, data) {
  window.chartUtils.renderDualAxisChart(container, {
    title: "Withdrawals and users chart",
    labels: data.labels,
    amounts: data.amounts,
    users: data.users,
    amountTick: 8000,
    userTick: 3,
    barLabel: "Withdrawal Amount",
    lineLabel: "Users Withdrew",
    barColor: "#d85a63",
    lineColor: "#2268ff",
  });
}

window.mountWithdrawalsChart = mountWithdrawalsChart;
