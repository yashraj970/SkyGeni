import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";

interface TrendData {
  current: number;
  previous: number;
  change: number;
}

interface TrendChartProps {
  data: TrendData;
  width?: number;
  height?: number;
  label?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  width = 100,
  height = 40,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Generate sparkline data
    const sparklineData = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const value = data.previous + (data.current - data.previous) * t;
      // Add some randomness for visual interest
      const noise =
        (Math.random() - 0.5) * Math.abs(data.current - data.previous) * 0.2;
      sparklineData.push(value + (i > 0 && i < steps ? noise : 0));
    }
    sparklineData[sparklineData.length - 1] = data.current; // Ensure last point is exact

    const x = d3
      .scaleLinear()
      .domain([0, sparklineData.length - 1])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(sparklineData) || 0, d3.max(sparklineData) || 0])
      .range([height - 4, 4]);

    const line = d3
      .line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    const color = data.change >= 0 ? "#10b981" : "#ef4444";

    // Area under the line
    const area = d3
      .area<number>()
      .x((_, i) => x(i))
      .y0(height)
      .y1((d) => y(d))
      .curve(d3.curveMonotoneX);

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", `trend-gradient-${data.change >= 0 ? "up" : "down"}`)
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    svg
      .append("path")
      .datum(sparklineData)
      .attr("fill", `url(#trend-gradient-${data.change >= 0 ? "up" : "down"})`)
      .attr("d", area);

    svg
      .append("path")
      .datum(sparklineData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);

    // End dot
    svg
      .append("circle")
      .attr("cx", x(sparklineData.length - 1))
      .attr("cy", y(data.current))
      .attr("r", 3)
      .attr("fill", color);
  }, [data, width, height, theme]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default TrendChart;
