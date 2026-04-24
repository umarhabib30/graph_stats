function mountWithdrawalsChart(container, data) {
  window.chartUtils.renderDualAxisLineChart(container, {
    title: "Withdrawals and Users",
    labels: data.labels,
    amounts: data.amounts,
    users: data.users,
    amountTick: 8000,
    userTick: 20,
    amountLabel: "Withdrawal Amount",
    userLabel: "Users Withdrew",
    amountColor: "#28a745",
    userColor: "#2268ff",
  });
}

window.mountWithdrawalsChart = mountWithdrawalsChart;
