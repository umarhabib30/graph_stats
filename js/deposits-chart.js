function mountDepositsChart(container, data) {
  window.chartUtils.renderDualAxisChart(container, {
    title: "Deposits and users chart",
    labels: data.labels,
    amounts: data.amounts,
    users: data.users,
    amountTick: 10000,
    userTick: 4,
    barLabel: "Deposit Amount",
    lineLabel: "Users Deposited",
    barColor: "#23b26d",
    lineColor: "#2268ff",
  });
}

window.mountDepositsChart = mountDepositsChart;
