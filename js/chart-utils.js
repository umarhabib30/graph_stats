function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMillions(value) {
  return `${value}M`;
}

function getDimensions(container) {
  const rect = container.getBoundingClientRect();
  return {
    width: Math.max(320, Math.floor(rect.width || container.clientWidth || 640)),
    height: Math.max(260, Math.floor(rect.height || container.clientHeight || 320)),
  };
}

function svgEl(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function smoothLinePath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev[0] + curr[0]) / 2;
    path += ` Q ${midX} ${prev[1]}, ${curr[0]} ${curr[1]}`;
  }
  return path;
}

function straightLinePath(points) {
  if (!points.length) return "";
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    path += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return path;
}

function appendLegend(container, items) {
  const legend = document.createElement("div");
  legend.className = "legend";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "legend-item";
    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.background = item.color;
    if (item.outline) {
      swatch.style.background = "#fff";
      swatch.style.border = `2px solid ${item.outline}`;
    }
    const label = document.createElement("span");
    label.textContent = item.label;
    row.append(swatch, label);
    legend.append(row);
  });
  container.append(legend);
}

function appendAxisLabel(svg, attrs, textContent) {
  const label = svgEl("text", attrs);
  label.textContent = textContent;
  svg.append(label);
}

function renderLineAreaChart(container, config) {
  renderFlatComparisonChart(container, {
    title: config.title,
    labels: config.labels,
    yMax: Math.ceil(Math.max(...config.values) / config.yTickStep) * config.yTickStep,
    singleSeriesWidthScale: 0.58,
    series: [
      {
        label: config.seriesLabel,
        color: config.lineColor,
        values: config.values,
      },
    ],
  });
}

function renderVolumeChart(container, config) {
  renderFlatComparisonChart(container, {
    title: "Trading volume chart",
    labels: config.labels,
    yMax: Math.ceil(Math.max(...config.values) / 20) * 20,
    yFormatter: (value) => formatMillions(Math.round(value)),
    singleSeriesWidthScale: 0.58,
    series: [
      {
        label: "Trading Volume",
        color: config.barColor,
        values: config.values,
      },
    ],
  });
}

function renderDualAxisChart(container, config) {
  container.innerHTML = "";
  appendLegend(container, [
    { label: config.barLabel, color: config.barColor },
    { label: config.lineLabel, color: config.lineColor },
  ]);

  const { width, height } = getDimensions(container);
  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": config.title });
  const margin = { top: 20, right: 58, bottom: 44, left: 66 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const baselineY = margin.top + chartHeight;
  const amountMax = Math.ceil(Math.max(...config.amounts) / config.amountTick) * config.amountTick;
  const userMax = Math.ceil(Math.max(...config.users) / config.userTick) * config.userTick;

  [0, amountMax / 2, amountMax].forEach((tick) => {
    const y = margin.top + chartHeight - (tick / amountMax) * chartHeight;
    svg.append(svgEl("line", { x1: margin.left, x2: width - margin.right, y1: y, y2: y, stroke: "#dbe3ef" }));
    appendAxisLabel(svg, { x: margin.left - 12, y: y + 4, "text-anchor": "end", fill: "#69768d", "font-size": "10" }, formatCompactNumber(tick));
  });

  [0, userMax / 2, userMax].forEach((tick) => {
    const y = margin.top + chartHeight - (tick / userMax) * chartHeight;
    appendAxisLabel(svg, { x: width - margin.right + 10, y: y + 4, fill: "#69768d", "font-size": "10" }, String(Math.round(tick)));
  });

  svg.append(svgEl("line", {
    x1: margin.left,
    x2: width - margin.right,
    y1: baselineY,
    y2: baselineY,
    stroke: "#cfd6df",
  }));

  const step = Math.max(1, Math.floor(config.labels.length / 6));
  const slotWidth = chartWidth / config.labels.length;
  const groupWidth = Math.max(6, Math.min(18, slotWidth * 0.8));
  const gap = Math.min(2, groupWidth * 0.14);
  const seriesBarWidth = Math.max(2, (groupWidth - gap) / 2);

  config.amounts.forEach((amount, index) => {
    const groupX = margin.left + index * slotWidth + (slotWidth - groupWidth) / 2;
    const amountBarHeight = (amount / amountMax) * chartHeight;
    const amountX = groupX;
    const amountY = margin.top + chartHeight - amountBarHeight;
    svg.append(svgEl("rect", {
      x: amountX,
      y: amountY,
      width: seriesBarWidth,
      height: Math.max(2, amountBarHeight),
      rx: Math.min(4, seriesBarWidth / 2),
      fill: config.barColor,
      opacity: "0.9",
    }));

    const usersBarHeight = (config.users[index] / userMax) * chartHeight;
    const usersX = groupX + seriesBarWidth + gap;
    const usersY = margin.top + chartHeight - usersBarHeight;
    svg.append(svgEl("rect", {
      x: usersX,
      y: usersY,
      width: seriesBarWidth,
      height: Math.max(2, usersBarHeight),
      rx: Math.min(4, seriesBarWidth / 2),
      fill: config.lineColor,
      opacity: "0.92",
    }));

    if (index % step === 0 || index === config.labels.length - 1) {
      appendAxisLabel(
        svg,
        { x: groupX + groupWidth / 2, y: height - 14, "text-anchor": "middle", fill: "#69768d", "font-size": "10" },
        config.labels[index].slice(5),
      );
    }
  });

  container.append(svg);
}

function renderFlatComparisonChart(container, config) {
  container.innerHTML = "";
  appendLegend(container, config.series.map((item) => ({
    label: item.label,
    color: item.color,
  })));

  const { width, height } = getDimensions(container);
  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": config.title });
  const margin = { top: 18, right: 24, bottom: 40, left: 42 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...config.series.flatMap((series) => series.values));
  const yMax = config.yMax || Math.ceil(maxValue * 1.1);
  const baselineY = margin.top + chartHeight - 8;

  [0, yMax].forEach((tick) => {
    const y = baselineY - (tick / yMax) * (chartHeight - 10);
    svg.append(svgEl("line", {
      x1: margin.left,
      x2: width - margin.right,
      y1: y,
      y2: y,
      stroke: "#dbe3ef",
    }));
    appendAxisLabel(
      svg,
      { x: margin.left - 6, y: y + 4, "text-anchor": "end", fill: "#69768d", "font-size": "10" },
      config.yFormatter ? config.yFormatter(tick) : String(Math.round(tick)),
    );
  });

  svg.append(svgEl("line", {
    x1: margin.left,
    x2: width - margin.right,
    y1: baselineY,
    y2: baselineY,
    stroke: "#cfd6df",
  }));

  const sampleIndexes = [0, Math.floor(config.labels.length / 2), config.labels.length - 1];
  sampleIndexes.forEach((index) => {
    const x = margin.left + (index / (config.labels.length - 1)) * chartWidth;
    svg.append(svgEl("line", { x1: x, x2: x, y1: baselineY, y2: baselineY + 5, stroke: "#8b97aa" }));
    appendAxisLabel(svg, { x, y: height - 12, "text-anchor": "middle", fill: "#69768d", "font-size": "10" }, config.labels[index]);
  });

  const slotWidth = chartWidth / config.labels.length;
  const groupWidthRatio = config.groupWidthRatio || 0.78;
  const groupWidthMax = config.groupWidthMax || 22;
  const singleSeriesWidthScale = config.singleSeriesWidthScale || 1;
  const baseGroupWidth = Math.max(2, Math.min(slotWidth * groupWidthRatio, groupWidthMax));
  const groupWidth = config.series.length === 1
    ? Math.max(2, baseGroupWidth * singleSeriesWidthScale)
    : baseGroupWidth;
  const gap = Math.min(2, groupWidth * 0.12);
  const barWidth = Math.max(1.2, (groupWidth - gap * (config.series.length - 1)) / config.series.length);

  config.labels.forEach((_, index) => {
    const groupX = margin.left + slotWidth * index + (slotWidth - groupWidth) / 2;

    config.series.forEach((series, seriesIndex) => {
      const value = series.values[index];
      const barHeight = (value / yMax) * (chartHeight - 10);
      const x = groupX + seriesIndex * (barWidth + gap);
      const y = baselineY - barHeight;

      svg.append(svgEl("rect", {
        x,
        y,
        width: barWidth,
        height: Math.max(2, barHeight),
        rx: Math.min(4, barWidth / 2),
        fill: series.color,
        opacity: "0.92",
      }));
    });
  });

  container.append(svg);
}

// Dual line chart – smooth lines for multiple series (e.g., Referral & Sub commissions)
function renderDualLineChart(container, config) {
  container.innerHTML = "";
  // Legend
  appendLegend(container, config.series.map((item) => ({ label: item.label, color: item.color })));

  const { width, height } = getDimensions(container);
  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": config.title });
  const margin = { top: 18, right: 24, bottom: 40, left: 42 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...config.series.flatMap((s) => s.values));
  const yMax = config.yMax || Math.ceil(maxValue * 1.1);
  const baselineY = margin.top + chartHeight - 8;

  // Y‑grid lines & labels
  [0, yMax].forEach((tick) => {
    const y = baselineY - (tick / yMax) * (chartHeight - 10);
    svg.append(svgEl("line", { x1: margin.left, x2: width - margin.right, y1: y, y2: y, stroke: "#dbe3ef" }));
    appendAxisLabel(svg, { x: margin.left - 6, y: y + 4, "text-anchor": "end", fill: "#69768d", "font-size": "10" }, config.yFormatter ? config.yFormatter(tick) : String(Math.round(tick)));
  });

  // Baseline
  svg.append(svgEl("line", { x1: margin.left, x2: width - margin.right, y1: baselineY, y2: baselineY, stroke: "#cfd6df" }));

  // X‑axis ticks (sample three points)
  const sampleIndexes = [0, Math.floor(config.labels.length / 2), config.labels.length - 1];
  sampleIndexes.forEach((idx) => {
    const x = margin.left + (idx / (config.labels.length - 1)) * chartWidth;
    svg.append(svgEl("line", { x1: x, x2: x, y1: baselineY, y2: baselineY + 5, stroke: "#8b97aa" }));
    appendAxisLabel(svg, { x, y: height - 12, "text-anchor": "middle", fill: "#69768d", "font-size": "10" }, config.labels[idx]);
  });

  // Draw each series as a smooth line (optional subtle markers)
  config.series.forEach((series) => {
    const points = series.values.map((value, i) => {
      const x = margin.left + (i / (config.labels.length - 1)) * chartWidth;
      const y = baselineY - (value / yMax) * (chartHeight - 10);
      return [x, y];
    });
    const pathData = smoothLinePath(points);
    svg.append(svgEl("path", { d: pathData, fill: "none", stroke: series.color, "stroke-width": "2" }));
    // Minimal markers (small circles) – keep subtle
    points.forEach(([x, y]) => {
      svg.append(svgEl("circle", { cx: x, cy: y, r: "2", fill: series.color }));
    });
  });

  container.append(svg);
}




window.chartUtils = {
  formatMoney,
  renderLineAreaChart,
  renderVolumeChart,
  renderDualAxisChart,
  renderFlatComparisonChart,
  renderDualLineChart,
  formatCompactNumber,
};
