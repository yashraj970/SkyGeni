import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 400,
  height = 250,
  horizontal = false,
  showValues = true,
  formatValue = (v) => v.toLocaleString(),
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = horizontal
      ? { top: 10, right: 60, bottom: 10, left: 100 }
      : { top: 20, right: 20, bottom: 50, left: 50 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colors = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.label))
      .range(["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"]);

    if (horizontal) {
      // Horizontal bar chart
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .range([0, chartWidth]);

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, chartHeight])
        .padding(0.3);

      // Y axis
      g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      g.selectAll(".domain, .tick line").remove();

      // Bars
      g.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("y", (d) => y(d.label) || 0)
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", (d) => d.color || colors(d.label))
        .attr("x", 0)
        .attr("width", 0)
        .transition()
        .duration(800)
        .ease(d3.easeQuadOut)
        .attr("width", (d) => x(d.value));

      // Values
      if (showValues) {
        g.selectAll(".value-label")
          .data(data)
          .join("text")
          .attr("class", "value-label")
          .attr("x", (d) => x(d.value) + 5)
          .attr("y", (d) => (y(d.label) || 0) + y.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .attr("fill", theme.palette.text.primary)
          .text((d) => formatValue(d.value));
      }
    } else {
      // Vertical bar chart
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, chartWidth])
        .padding(0.3);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 0])
        .nice()
        .range([chartHeight, 0]);

      // X axis
      g.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary)
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end");

      g.selectAll(".domain").remove();
      g.selectAll(".tick line").remove();

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

      // Bars
      g.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.label) || 0)
        .attr("width", x.bandwidth())
        .attr("rx", 4)
        .attr("fill", (d) => d.color || colors(d.label))
        .attr("y", chartHeight)
        .attr("height", 0)
        .transition()
        .duration(800)
        .ease(d3.easeQuadOut)
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => chartHeight - y(d.value));

      // Values
      if (showValues) {
        g.selectAll(".value-label")
          .data(data)
          .join("text")
          .attr("class", "value-label")
          .attr("x", (d) => (x(d.label) || 0) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.value) - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("font-weight", "600")
          .attr("fill", theme.palette.text.primary)
          .text((d) => formatValue(d.value));
      }
    }
  }, [data, width, height, horizontal, showValues, formatValue, theme]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default BarChart;
