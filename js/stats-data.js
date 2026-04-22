const MONTHS = [
  { key: "2026-01", label: "January", days: 31 },
  { key: "2026-02", label: "February", days: 28 },
  { key: "2026-03", label: "March", days: 31 },
];

const CLIENT_CONFIG = {
  updatedAt: "2026-04-18 16:42:30 UTC",
  invitation: {
    referralLink: "https://www.bitunix.com/register?vipCode=YcEk",
    referralCode: "YcEk",
    ratios: {
      futures: { my: "75%", referral: "0%" },
      spot: { my: "50%", referral: "0%" },
    },
  },
  accountOverview: {
    teamSize: 2,
    directReferrals: 1,
    subPartners: 1,
    recentlyRegistered: [
      { uid: "932487197", partner: "Abi", registeredAt: "2026-03-23 15:15:39" },
      { uid: "655634191", partner: "Abi", registeredAt: "2026-03-19 10:44:06" },
    ],
  },
  metrics: {
    earnings: {
      total: 72480.36,
      referral: 42165.22,
      sub: 30315.14,
      monthly: [18422.14, 22608.91, 31449.31],
      referralMonthly: [10094.12, 12887.44, 19183.66],
      subMonthly: [8328.02, 9721.47, 12265.65],
    },
    newUsers: {
      total: 221,
      monthly: [34, 78, 109],
    },
    volume: {
      total: 376,
      referral: 218,
      sub: 158,
      monthly: [161, 97, 118],
      referralMonthly: [93, 56, 69],
      subMonthly: [68, 41, 49],
    },
    fees: {
      total: 135942.18,
      referral: 78211.65,
      sub: 57730.53,
      monthly: [31688.47, 44516.93, 59736.78],
      referralMonthly: [18962.31, 25454.17, 33795.17],
      subMonthly: [12726.16, 19062.76, 25941.61],
    },
    deposits: {
      totalAmount: 898229.42,
      totalUsers: 221,
      amountMonthly: [241903.26, 285444.89, 370881.27],
      usersMonthly: [60, 80, 81],
    },
    withdrawals: {
      totalAmount: 567495.21,
      totalUsers: 89,
      usersMonthly: [15, 25, 49],
      amountMonthly: [152846.12, 171903.54, 242745.55],
    },
  },
};

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function datesForQuarter() {
  const dates = [];
  for (const month of MONTHS) {
    for (let day = 1; day <= month.days; day += 1) {
      dates.push(`${month.key}-${String(day).padStart(2, "0")}`);
    }
  }
  return dates;
}

function distributeIntegers(total, count, seed, startBias, endBias, noiseScale) {
  const rand = createRng(seed);
  const weights = Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 1 : index / (count - 1);
    const trend = startBias + (endBias - startBias) * t;
    const wave = 1 + Math.sin((t * Math.PI * 1.35) + rand() * 0.55) * 0.19;
    const noise = 1 + (rand() - 0.5) * noiseScale;
    return Math.max(0.08, trend * wave * noise);
  });
  const sum = weights.reduce((acc, value) => acc + value, 0);
  const raw = weights.map((weight) => (weight / sum) * total);
  const base = raw.map((value) => Math.floor(value));
  let remainder = total - base.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);

  for (let i = 0; i < remainder; i += 1) {
    base[order[i % order.length].index] += 1;
  }

  return base;
}

function distributeAmounts(total, weights, decimals = 2) {
  const scale = 10 ** decimals;
  const scaledTotal = Math.round(total * scale);
  const weightSum = weights.reduce((acc, value) => acc + value, 0);
  const raw = weights.map((weight) => (weight / weightSum) * scaledTotal);
  const base = raw.map((value) => Math.floor(value));
  let remainder = scaledTotal - base.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);

  for (let i = 0; i < remainder; i += 1) {
    base[order[i % order.length].index] += 1;
  }

  return base.map((value) => value / scale);
}

function cumulative(values) {
  let total = 0;
  return values.map((value) => {
    total += value;
    return total;
  });
}

function expandMonthlyIntegers(monthlyTotals, options) {
  return monthlyTotals.flatMap((target, monthIndex) => distributeIntegers(
    target,
    MONTHS[monthIndex].days,
    options.seed + monthIndex,
    options.startBias + monthIndex * options.startStep,
    options.endBias + monthIndex * options.endStep,
    options.noiseScale,
  ));
}

function expandMonthlyAmounts(monthlyTotals, options) {
  const rand = createRng(options.seed);
  return monthlyTotals.flatMap((target, monthIndex) => {
    const dayCount = MONTHS[monthIndex].days;
    const dailyWeights = Array.from({ length: dayCount }, (_, index) => {
      const t = dayCount === 1 ? 1 : index / (dayCount - 1);
      const trend = options.startBias + (options.endBias - options.startBias) * t + monthIndex * options.monthLift;
      const wave = 1 + Math.sin((t * Math.PI * options.waveScale) + rand() * 0.7) * 0.18;
      const noise = 1 + (rand() - 0.5) * options.noiseScale;
      return Math.max(0.12, trend * wave * noise);
    });
    return distributeAmounts(target, dailyWeights);
  });
}

function buildNewUsers() {
  const daily = expandMonthlyIntegers(CLIENT_CONFIG.metrics.newUsers.monthly, {
    seed: 310,
    startBias: 0.46,
    endBias: 1.08,
    startStep: 0.14,
    endStep: 0.18,
    noiseScale: 0.38,
  });

  return {
    total: CLIENT_CONFIG.metrics.newUsers.total,
    monthly: CLIENT_CONFIG.metrics.newUsers.monthly,
    daily,
    cumulative: cumulative(daily),
  };
}

function buildVolume() {
  const result = buildLineMetric(CLIENT_CONFIG.metrics.volume, 4184, 1.52);

  return {
    total: result.total,
    referral: result.referral,
    sub: result.sub,
    monthly: CLIENT_CONFIG.metrics.volume.monthly,
    daily: result.totalDaily,
    referralDaily: result.referralDaily,
    subDaily: result.subDaily,
  };
}

function buildDeposits() {
  const userDaily = expandMonthlyIntegers(CLIENT_CONFIG.metrics.deposits.usersMonthly, {
    seed: 8122,
    startBias: 0.6,
    endBias: 1.2,
    startStep: 0.1,
    endStep: 0.1,
    noiseScale: 0.3,
  });
  const amountDaily = expandMonthlyAmounts(CLIENT_CONFIG.metrics.deposits.amountMonthly, {
    seed: 8123,
    startBias: 0.82,
    endBias: 1.36,
    monthLift: 0.11,
    waveScale: 1.7,
    noiseScale: 0.46,
  }).map((value, index) => clamp(value + userDaily[index] * 18.5, 20, 25000));
  const normalizedAmountDaily = distributeAmounts(
    CLIENT_CONFIG.metrics.deposits.totalAmount,
    amountDaily,
  );

  return {
    totalAmount: CLIENT_CONFIG.metrics.deposits.totalAmount,
    totalUsers: CLIENT_CONFIG.metrics.deposits.totalUsers,
    amountMonthly: CLIENT_CONFIG.metrics.deposits.amountMonthly,
    userDaily,
    userCumulative: cumulative(userDaily),
    amountDaily: normalizedAmountDaily,
  };
}

function buildWithdrawals() {
  const userDaily = expandMonthlyIntegers(CLIENT_CONFIG.metrics.withdrawals.usersMonthly, {
    seed: 990,
    startBias: 0.54,
    endBias: 1.02,
    startStep: 0.07,
    endStep: 0.12,
    noiseScale: 0.4,
  });
  const amountDaily = expandMonthlyAmounts(CLIENT_CONFIG.metrics.withdrawals.amountMonthly, {
    seed: 5511,
    startBias: 0.78,
    endBias: 1.28,
    monthLift: 0.08,
    waveScale: 1.55,
    noiseScale: 0.43,
  }).map((value, index) => clamp(value + userDaily[index] * 22.5, 18, 18000));
  const normalizedAmountDaily = distributeAmounts(
    CLIENT_CONFIG.metrics.withdrawals.totalAmount,
    amountDaily,
  );

  return {
    totalAmount: CLIENT_CONFIG.metrics.withdrawals.totalAmount,
    totalUsers: CLIENT_CONFIG.metrics.withdrawals.totalUsers,
    amountMonthly: CLIENT_CONFIG.metrics.withdrawals.amountMonthly,
    usersMonthly: CLIENT_CONFIG.metrics.withdrawals.usersMonthly,
    userDaily,
    userCumulative: cumulative(userDaily),
    amountDaily: normalizedAmountDaily,
  };
}

function buildLineMetric(metricConfig, seed, waveScale) {
  const totalSeries = expandMonthlyAmounts(metricConfig.monthly, {
    seed,
    startBias: 0.74,
    endBias: 1.31,
    monthLift: 0.09,
    waveScale,
    noiseScale: 0.39,
  });
  const referralSeries = expandMonthlyAmounts(metricConfig.referralMonthly, {
    seed: seed + 101,
    startBias: 0.68,
    endBias: 1.27,
    monthLift: 0.08,
    waveScale: waveScale + 0.08,
    noiseScale: 0.37,
  });
  const subSeries = expandMonthlyAmounts(metricConfig.subMonthly, {
    seed: seed + 203,
    startBias: 0.72,
    endBias: 1.23,
    monthLift: 0.07,
    waveScale: waveScale + 0.15,
    noiseScale: 0.34,
  });

  return {
    total: metricConfig.total,
    referral: metricConfig.referral,
    sub: metricConfig.sub,
    totalDaily: totalSeries,
    referralDaily: referralSeries,
    subDaily: subSeries,
  };
}

window.dashboardData = (() => {
  const dates = datesForQuarter();
  const newUsers = buildNewUsers();
  const volume = buildVolume();
  const deposits = buildDeposits(newUsers.daily);
  const withdrawals = buildWithdrawals();
  const earnings = buildLineMetric(CLIENT_CONFIG.metrics.earnings, 6201, 1.45);
  const fees = buildLineMetric(CLIENT_CONFIG.metrics.fees, 7301, 1.58);

  return {
    config: CLIENT_CONFIG,
    dates,
    months: MONTHS.map((month) => month.label),
    updatedAt: CLIENT_CONFIG.updatedAt,
    invitation: CLIENT_CONFIG.invitation,
    accountOverview: CLIENT_CONFIG.accountOverview,
    newUsers,
    tradingVolume: volume,
    deposits,
    withdrawals,
    earnings,
    fees,
  };
})();
