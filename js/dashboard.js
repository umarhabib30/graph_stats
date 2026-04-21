const $ = (selector) => document.querySelector(selector);

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = value;
}

function setInputValue(selector, value) {
  const node = $(selector);
  if (node instanceof HTMLInputElement) node.value = value;
}

function renderRecentlyRegistered(rows) {
  const tbody = $("#recentlyRegisteredRows");
  if (!tbody) return;
  tbody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.uid}</td>
      <td>${row.partner}</td>
      <td>${row.registeredAt}</td>
    </tr>
  `).join("");
}

function renderDashboard() {
  const dashboardData = window.dashboardData;
  const { formatMoney } = window.chartUtils;
  const labels = dashboardData.dates;

  setInputValue("#referralLink", dashboardData.invitation.referralLink);
  setInputValue("#referralCode", dashboardData.invitation.referralCode);
  setText("#futuresMyRatio", dashboardData.invitation.ratios.futures.my);
  setText("#futuresReferralRatio", dashboardData.invitation.ratios.futures.referral);
  setText("#spotMyRatio", dashboardData.invitation.ratios.spot.my);
  setText("#spotReferralRatio", dashboardData.invitation.ratios.spot.referral);
  setText("#teamSize", String(dashboardData.accountOverview.teamSize));
  setText("#directReferrals", String(dashboardData.accountOverview.directReferrals));
  setText("#subPartners", String(dashboardData.accountOverview.subPartners));
  renderRecentlyRegistered(dashboardData.accountOverview.recentlyRegistered);

  setText("#updatedAt", dashboardData.updatedAt);
  setText("#earningsTotal", formatMoney(dashboardData.earnings.total));
  setText("#earningsReferral", formatMoney(dashboardData.earnings.referral));
  setText("#earningsSub", formatMoney(dashboardData.earnings.sub));
  setText("#newUsersTotal", String(dashboardData.newUsers.total));
  setText("#volumeTotal", `${dashboardData.tradingVolume.total}M`);
  setText("#volumeReferral", `${dashboardData.tradingVolume.referral}M`);
  setText("#volumeSub", `${dashboardData.tradingVolume.sub}M`);
  setText("#feeTotal", formatMoney(dashboardData.fees.total));
  setText("#feeReferral", formatMoney(dashboardData.fees.referral));
  setText("#feeSub", formatMoney(dashboardData.fees.sub));
  setText("#depositTotal", formatMoney(dashboardData.deposits.totalAmount));
  setText("#depositUsersTotal", String(dashboardData.deposits.totalUsers));
  setText("#withdrawalTotal", formatMoney(dashboardData.withdrawals.totalAmount));
  setText("#withdrawalUsersTotal", String(dashboardData.withdrawals.totalUsers));

  window.chartUtils.renderFlatComparisonChart($("#earningsChart"), {
    title: "My earnings chart",
    labels,
    series: [
      { label: "Referral's Commissions", color: "#64d98a", values: dashboardData.earnings.referralDaily },
      { label: "Sub's Commissions", color: "#5a88ff", values: dashboardData.earnings.subDaily },
    ],
  });

  window.mountNewUsersChart($("#newUsersChart"), {
    labels,
    cumulative: dashboardData.newUsers.cumulative,
  });

  window.mountTradingVolumeChart($("#tradingVolumeChart"), {
    labels,
    values: dashboardData.tradingVolume.daily,
  });

  window.chartUtils.renderFlatComparisonChart($("#feeChart"), {
    title: "Fee chart",
    labels,
    series: [
      { label: "Referral's Fee", color: "#64d98a", values: dashboardData.fees.referralDaily },
      { label: "Sub's Team's Fee", color: "#5a88ff", values: dashboardData.fees.subDaily },
    ],
  });

  window.mountDepositsChart($("#depositsChart"), {
    labels,
    amounts: dashboardData.deposits.amountDaily,
    users: dashboardData.deposits.userCumulative,
  });

  window.mountWithdrawalsChart($("#withdrawalsChart"), {
    labels,
    amounts: dashboardData.withdrawals.amountDaily,
    users: dashboardData.withdrawals.userCumulative,
  });
}

function bindSidebarToggle() {
  const sidebar = $("#sidebar");
  const toggle = $("#sidebarToggle");
  toggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("is-expanded");
    sidebar?.classList.toggle("is-collapsed");
  });
}

function bindCopyButtons() {
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.getAttribute("data-copy-target"));
      if (!(target instanceof HTMLInputElement)) return;
      try {
        await navigator.clipboard.writeText(target.value);
        button.textContent = "✓";
        window.setTimeout(() => {
          button.textContent = "⧉";
        }, 1200);
      } catch {
        target.select();
      }
    });
  });
}

bindSidebarToggle();
bindCopyButtons();
renderDashboard();
window.addEventListener("resize", renderDashboard);
