import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";

interface GaugeChartProps {
  value: number | null | undefined;
  target: number | null | undefined;
  label?: string;
  width?: number;
  height?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  target,
  label = "Progress",
  width = 200,
  height = 140,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Safe values with defaults
  const safeValue = value ?? 0;
  const safeTarget = target ?? 1; // Avoid division by zero

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight * 2) / 2;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - margin.bottom})`);

    // Background arc
    const backgroundArc = d3
      .arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", backgroundArc as any)
      .attr("fill", "#e2e8f0");

    // Progress calculation
    const progress = Math.min(safeValue / safeTarget, 1.5);
    const endAngle = -Math.PI / 2 + progress * Math.PI;

    // Progress arc
    const progressArc = d3
      .arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(endAngle)
      .cornerRadius(4);

    // Color based on progress
    const getColor = () => {
      if (progress >= 1) return "#10b981";
      if (progress >= 0.7) return "#f59e0b";
      return "#ef4444";
    };

    g.append("path")
      .attr("d", progressArc as any)
      .attr("fill", getColor());

    // Target marker
    const targetAngle = -Math.PI / 2 + Math.PI;
    const markerRadius = radius - 10;
    g.append("line")
      .attr("x1", markerRadius * Math.cos(targetAngle))
      .attr("y1", markerRadius * Math.sin(targetAngle))
      .attr("x2", (radius + 5) * Math.cos(targetAngle))
      .attr("y2", (radius + 5) * Math.sin(targetAngle))
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2);

    // Percentage text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -20)
      .attr("font-size", "24px")
      .attr("font-weight", "700")
      .attr("fill", getColor())
      .text(`${Math.round(progress * 100)}%`);
  }, [safeValue, safeTarget, width, height]);

  return (
    <Box sx={{ textAlign: "center" }}>
      <svg ref={svgRef} width={width} height={height} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

export default GaugeChart;
