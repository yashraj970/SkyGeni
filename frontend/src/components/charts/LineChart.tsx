import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";

interface LineChartData {
  label: string;
  value: number;
  target?: number;
}

interface LineChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  showTarget?: boolean;
  showArea?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 500,
  height = 250,
  showTarget = true,
  showArea = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.label))
      .range([0, chartWidth])
      .padding(0.5);

    const maxValue = d3.max(data, (d) => Math.max(d.value, d.target || 0)) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .nice()
      .range([chartHeight, 0]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => ""),
      )
      .selectAll("line")
      .style("stroke", theme.palette.divider)
      .style("stroke-dasharray", "3,3");

    g.selectAll(".grid .domain").remove();

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", theme.palette.text.secondary);

    g.selectAll(".domain").remove();
    g.selectAll(".tick line").remove();

    // Y axis
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `$${d3.format(".0s")(d as number)}`),
      )
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", theme.palette.text.secondary);

    // Area gradient
    if (showArea) {
      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#2563eb")
        .attr("stop-opacity", 0.3);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#2563eb")
        .attr("stop-opacity", 0);

      const area = d3
        .area<LineChartData>()
        .x((d) => x(d.label) || 0)
        .y0(chartHeight)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "url(#area-gradient)")
        .attr("d", area);
    }

    // Target line
    if (showTarget && data.some((d) => d.target)) {
      const targetLine = d3
        .line<LineChartData>()
        .x((d) => x(d.label) || 0)
        .y((d) => y(d.target || 0))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data.filter((d) => d.target !== undefined))
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", targetLine);
    }

    // Value line
    const line = d3
      .line<LineChartData>()
      .x((d) => x(d.label) || 0)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const path = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate line
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0);

    // Data points
    g.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.label) || 0)
      .attr("cy", (d) => y(d.value))
      .attr("r", 0)
      .attr("fill", "#2563eb")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .transition()
      .delay(800)
      .duration(300)
      .attr("r", 5);

    // Legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${chartWidth - 100}, -10)`);

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 3);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 4)
      .text("Actual")
      .style("font-size", "11px")
      .style("fill", theme.palette.text.secondary);

    if (showTarget) {
      legend
        .append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 15)
        .attr("y2", 15)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      legend
        .append("text")
        .attr("x", 25)
        .attr("y", 19)
        .text("Target")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);
    }
  }, [data, width, height, showTarget, showArea, theme]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default LineChart;
