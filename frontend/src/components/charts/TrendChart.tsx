import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface TrendData {
  current: number | null | undefined;
  previous: number | null | undefined;
  change: number | null | undefined;
}

interface TrendChartProps {
  data: TrendData;
  width?: number;
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  width = 100,
  height = 40,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Safe values with defaults
  const current = data.current ?? 0;
  const previous = data.previous ?? 0;
  const change = data.change ?? 0;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Generate sparkline data
    const sparklineData: number[] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const value = previous + (current - previous) * t;
      // Add some randomness for visual interest
      const noise = (Math.random() - 0.5) * Math.abs(current - previous) * 0.2;
      sparklineData.push(value + (i > 0 && i < steps ? noise : 0));
    }
    sparklineData[sparklineData.length - 1] = current; // Ensure last point is exact

    const x = d3
      .scaleLinear()
      .domain([0, sparklineData.length - 1])
      .range([0, width]);

    const minVal = d3.min(sparklineData) ?? 0;
    const maxVal = d3.max(sparklineData) ?? 1;

    const y = d3
      .scaleLinear()
      .domain([minVal, maxVal])
      .range([height - 4, 4]);

    const line = d3
      .line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    const color = change >= 0 ? "#10b981" : "#ef4444";

    // Area under the line
    const area = d3
      .area<number>()
      .x((_, i) => x(i))
      .y0(height)
      .y1((d) => y(d))
      .curve(d3.curveMonotoneX);

    const gradientId = `trend-gradient-${change >= 0 ? "up" : "down"}-${Math.random().toString(36).substr(2, 9)}`;

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
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
      .attr("fill", `url(#${gradientId})`)
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
      .attr("cy", y(current))
      .attr("r", 3)
      .attr("fill", color);
  }, [current, previous, change, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default TrendChart;
