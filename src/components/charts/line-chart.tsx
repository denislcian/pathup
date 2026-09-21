import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { linear, niceTicks } from '@/components/charts/scale';
import { AppText } from '@/components/ui/app-text';
import { chartColors, colors, fonts, radius, spacing } from '@/theme/tokens';

export type ChartPoint = {
  /** Short label for the x axis and the tooltip, e.g. "12 sep". */
  label: string;
  value: number;
};

type LineChartProps = {
  data: ChartPoint[];
  formatValue: (value: number) => string;
  /** Axis ticks, usually without the unit so they fit: "87,5" instead of "87,5 kg". */
  formatTick?: (value: number) => string;
  /** Describes the chart for screen readers, e.g. "1RM estimado de Press banca". */
  title: string;
  height?: number;
};

const PAD = { top: 20, right: 20, bottom: 28, left: 44 };
const TOOLTIP_WIDTH = 120;

/**
 * Single-series line chart: 2px line, 10% wash, hairline grid, the last value labelled. Hover,
 * tap or keyboard focus on a session shows its value; every point is also a focusable element
 * with its value in the label, so nothing depends on seeing the line.
 */
export function LineChart({
  data,
  formatValue,
  formatTick = formatValue,
  title,
  height = 200,
}: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const values = data.map((point) => point.value);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const domain: [number, number] = [ticks[0], ticks.at(-1)!];
  const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
  const plotBottom = height - PAD.bottom;

  const x = (index: number) =>
    data.length === 1
      ? PAD.left + plotWidth / 2
      : linear(index, [0, data.length - 1], [PAD.left, PAD.left + plotWidth]);
  const y = (value: number) => linear(value, domain, [plotBottom, PAD.top]);

  const line = data
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.value)}`)
    .join(' ');
  const area =
    data.length > 1 ? `${line} L${x(data.length - 1)},${plotBottom} L${x(0)},${plotBottom} Z` : '';

  const last = data.length - 1;
  // Axis labels only at the ends (and the middle when there is room): enough to read the dates.
  const xLabels = new Set([
    0,
    last,
    ...(width > 420 && data.length > 4 ? [Math.round(last / 2)] : []),
  ]);
  // One column per session, as wide as the gap between points, so the pointer never has to
  // land on a 10px dot.
  const slot = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const activePoint = active === null ? null : data[active];
  const tooltipLeft =
    active === null
      ? 0
      : Math.min(Math.max(x(active) - TOOLTIP_WIDTH / 2, 0), Math.max(width - TOOLTIP_WIDTH, 0));

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height} aria-hidden>
          {ticks.map((tick) => (
            <Line
              key={`grid-${tick}`}
              x1={PAD.left}
              x2={PAD.left + plotWidth}
              y1={y(tick)}
              y2={y(tick)}
              stroke={chartColors.grid}
              strokeWidth={1}
            />
          ))}
          {ticks.map((tick) => (
            <SvgText
              key={`tick-${tick}`}
              x={PAD.left - 8}
              y={y(tick) + 4}
              fontSize={11}
              fontFamily={fonts.body}
              fill={colors.textMuted}
              textAnchor="end">
              {formatTick(tick)}
            </SvgText>
          ))}
          {data.map((point, index) =>
            xLabels.has(index) ? (
              <SvgText
                key={`x-${index}`}
                x={x(index)}
                y={height - 8}
                fontSize={11}
                fontFamily={fonts.body}
                fill={colors.textMuted}
                textAnchor={
                  data.length === 1
                    ? 'middle'
                    : index === 0
                      ? 'start'
                      : index === last
                        ? 'end'
                        : 'middle'
                }>
                {point.label}
              </SvgText>
            ) : null,
          )}

          {area ? <Path d={area} fill={chartColors.seriesWash} /> : null}
          {data.length > 1 ? (
            <Path
              d={line}
              stroke={chartColors.series}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          ) : null}

          {active !== null ? (
            <Line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={plotBottom}
              stroke={chartColors.crosshair}
              strokeWidth={1}
            />
          ) : null}

          {data.map((point, index) =>
            index === last || index === active || data.length <= 12 ? (
              <Circle
                key={`dot-${index}`}
                cx={x(index)}
                cy={y(point.value)}
                r={index === active || index === last ? 5 : 4}
                fill={chartColors.series}
                stroke={colors.surface}
                strokeWidth={2}
              />
            ) : null,
          )}

          {active === null && data.length > 0 ? (
            <SvgText
              x={x(last)}
              y={y(data[last].value) - 12}
              fontSize={12}
              fontFamily={fonts.bodySemiBold}
              fill={colors.text}
              textAnchor={data.length === 1 ? 'middle' : 'end'}>
              {formatValue(data[last].value)}
            </SvgText>
          ) : null}
        </Svg>
      ) : null}

      <View style={styles.hitLayer} aria-label={title} role="list">
        {data.map((point, index) => (
          <Pressable
            key={`hit-${index}`}
            role="listitem"
            aria-label={`${point.label}: ${formatValue(point.value)}`}
            onHoverIn={() => setActive(index)}
            onHoverOut={() => setActive((current) => (current === index ? null : current))}
            onFocus={() => setActive(index)}
            onBlur={() => setActive((current) => (current === index ? null : current))}
            onPress={() => setActive((current) => (current === index ? null : index))}
            style={[styles.hit, { left: x(index) - slot / 2, width: slot }]}
          />
        ))}
      </View>

      {activePoint ? (
        <View style={[styles.tooltip, { left: tooltipLeft }]} pointerEvents="none">
          <AppText variant="label" style={styles.tooltipValue}>
            {formatValue(activePoint.value)}
          </AppText>
          <AppText variant="caption" tone="muted">
            {activePoint.label}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hitLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: PAD.bottom,
  },
  hit: {
    // The hit areas are wider than the dots: a whole column per session.
    position: 'absolute',
    top: 0,
    bottom: 0,
    cursor: 'pointer',
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    width: TOOLTIP_WIDTH,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  tooltipValue: {
    fontFamily: fonts.bodySemiBold,
  },
});
