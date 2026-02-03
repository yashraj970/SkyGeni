import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Box, Typography, useTheme } from "@mui/material";

interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  width?: number;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 250,
  height = 250,
  centerLabel,
  centerValue,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const colors = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.label))
      .range([
        "#2563eb",
        "#7c3aed",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#64748b",
      ]);

    const pie = d3
      .pie<DonutChartData>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.02);

    const hoverArc = d3
      .arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 8)
      .cornerRadius(4)
      .padAngle(0.02);

    // Draw arcs
    const arcs = g
      .selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color || colors(d.data.label))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", hoverArc);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", arc);
      });

    // Animate
    arcs
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || "";
        };
      });

    // Center text
    if (centerValue) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", centerLabel ? "-0.2em" : "0.35em")
        .attr("font-size", "24px")
        .attr("font-weight", "700")
        .attr("fill", theme.palette.text.primary)
        .text(centerValue);

      if (centerLabel) {
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1.2em")
          .attr("font-size", "12px")
          .attr("fill", theme.palette.text.secondary)
          .text(centerLabel);
      }
    }
  }, [data, width, height, centerLabel, centerValue, theme]);

  // Legend
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);
  const colors = d3
    .scaleOrdinal<string>()
    .domain(data.map((d) => d.label))
    .range(["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#64748b"]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
      <svg ref={svgRef} width={width} height={height} />
      <Box sx={{ minWidth: 120 }}>
        {data.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: item.color || colors(item.label),
              }}
            />
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {((item.value / totalValue) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DonutChart;
