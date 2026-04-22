function mountDepositsChart(container, data) {
  window.chartUtils.renderDualAxisLineChart(container, {
    title: "Deposits and Users",
    labels: data.labels,
    amounts: data.amounts,
    users: data.users,
    amountTick: 10000,
    userTick: 50,
    amountLabel: "Deposit Amount",
    userLabel: "Users Deposited",
    amountColor: "#23b26d",
    userColor: "#2268ff",
  });
}

window.mountDepositsChart = mountDepositsChart;
