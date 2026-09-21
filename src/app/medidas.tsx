import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { CloudOff, Ruler } from '@/components/icons';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Columns } from '@/components/ui/columns';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useHover } from '@/components/ui/use-hover';
import { parseBirthDate, todayIso } from '@/domain/age';
import {
  hasAnyValue,
  MEASUREMENT_FIELDS,
  MEASUREMENT_UNITS,
  measurementSeries,
  movingAverage,
  trendChange,
  validateMeasurement,
  type Measurement,
  type MeasurementField,
  type MeasurementIssue,
  type MeasurementValues,
} from '@/domain/measurements';
import { maskBirthDate } from '@/features/auth/birth-date-mask';
import { parseDecimal } from '@/features/workout/logger-components';
import {
  useDeleteMeasurement,
  useMeasurements,
  useSaveMeasurement,
} from '@/features/measurements/measurements-api';
import { formatMediumDate, formatNumber, formatShortDate } from '@/lib/format';
import { colors, fonts, minTouchTarget, radius, spacing } from '@/theme/tokens';

type FormText = Record<MeasurementField, string>;

const EMPTY_FORM = Object.fromEntries(MEASUREMENT_FIELDS.map((field) => [field, ''])) as FormText;
const HISTORY_SHOWN = 8;

function toDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function toLocalDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export default function MeasurementsScreen() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const query = useMeasurements();
  const save = useSaveMeasurement();
  const remove = useDeleteMeasurement();

  const [date, setDate] = useState(() => toDisplayDate(todayIso()));
  const [form, setForm] = useState<FormText>(EMPTY_FORM);
  const [issues, setIssues] = useState<MeasurementIssue[]>([]);
  const [dateError, setDateError] = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chosen, setChosen] = useState<MeasurementField | null>(null);

  const measurements = query.data?.measurements ?? [];
  const isoDate = parseBirthDate(date);
  const existing = isoDate ? measurements.find((entry) => entry.date === isoDate) : undefined;

  const unit = (field: MeasurementField) => MEASUREMENT_UNITS[field];
  const format = (field: MeasurementField, value: number) =>
    `${formatNumber(value, language)} ${unit(field)}`;

  function load(entry: Measurement) {
    setDate(toDisplayDate(entry.date));
    setForm(
      Object.fromEntries(
        MEASUREMENT_FIELDS.map((field) => {
          const value = entry[field];
          return [
            field,
            value === null || value === undefined ? '' : formatNumber(value, language),
          ];
        }),
      ) as FormText,
    );
    setIssues([]);
    setSaved(false);
  }

  function submit() {
    const day = parseBirthDate(date);
    const values = Object.fromEntries(
      MEASUREMENT_FIELDS.map((field) => [
        field,
        form[field].trim() === '' ? null : parseDecimal(form[field]),
      ]),
    ) as MeasurementValues;
    const found = validateMeasurement(values);
    setDateError(day === null);
    setEmptyError(!hasAnyValue(values));
    setIssues(found);
    setSaved(false);
    if (day === null || !hasAnyValue(values) || found.length > 0) return;

    save.mutate(
      { ...values, date: day },
      {
        onSuccess: () => {
          setSaved(true);
          setForm(EMPTY_FORM);
          setDate(toDisplayDate(todayIso()));
        },
      },
    );
  }

  const available = MEASUREMENT_FIELDS.filter(
    (field) => measurementSeries(measurements, field).length > 0,
  );
  const field = chosen && available.includes(chosen) ? chosen : available[0];
  const series = field ? measurementSeries(measurements, field) : [];
  // Body weight swings with water and food: the chart shows the 7-day average, the trend.
  const plotted = field === 'weightKg' ? movingAverage(series) : series;
  const trend = trendChange(series);
  const latest = series.at(-1);

  const formCard = (
    <Card style={styles.card}>
      <AppText variant="heading" role="heading">
        {existing ? t('measurements.editTitle') : t('measurements.formTitle')}
      </AppText>
      <TextField
        label={t('measurements.date')}
        hint={t('measurements.dateHint')}
        value={date}
        onChangeText={(text) => setDate(maskBirthDate(text))}
        keyboardType="number-pad"
        maxLength={10}
        error={dateError ? t('measurements.errors.date') : null}
      />
      <View style={styles.grid}>
        {MEASUREMENT_FIELDS.map((item) => {
          const issue = issues.find((found) => found.field === item);
          return (
            <View key={item} style={styles.gridItem}>
              <AppText variant="caption" tone="muted">
                {t(`measurements.fields.${item}`)} ({unit(item)})
              </AppText>
              <TextInput
                value={form[item]}
                onChangeText={(text) => setForm((current) => ({ ...current, [item]: text }))}
                keyboardType="decimal-pad"
                placeholder={
                  existing?.[item] !== undefined && existing[item] !== null
                    ? formatNumber(existing[item]!, language)
                    : '—'
                }
                placeholderTextColor={colors.textMuted}
                selectionColor={colors.accent}
                aria-label={`${t(`measurements.fields.${item}`)} (${unit(item)})`}
                aria-invalid={issue ? true : undefined}
                style={[styles.input, issue && styles.inputError]}
              />
              {issue ? (
                <AppText variant="caption" tone="danger" role="alert">
                  {t('measurements.errors.range', {
                    min: formatNumber(issue.min, language),
                    max: formatNumber(issue.max, language),
                  })}
                </AppText>
              ) : null}
            </View>
          );
        })}
      </View>
      {emptyError ? (
        <AppText tone="danger" role="alert">
          {t('measurements.errors.empty')}
        </AppText>
      ) : null}
      {save.isError ? (
        <AppText tone="danger" role="alert">
          {t('measurements.errors.save')}
        </AppText>
      ) : null}
      {saved ? (
        <AppText tone="accent" role="status">
          {t('measurements.saved')}
        </AppText>
      ) : null}
      <AppText variant="caption" tone="muted">
        {t('measurements.tip')}
      </AppText>
      <Button
        label={save.isPending ? t('measurements.saving') : t('measurements.save')}
        disabled={save.isPending}
        aria-busy={save.isPending}
        onPress={submit}
      />
      {existing ? (
        <Button
          label={t('measurements.deleteDay')}
          variant="ghost"
          disabled={remove.isPending}
          onPress={() =>
            remove.mutate(existing.date, {
              onSuccess: () => {
                setForm(EMPTY_FORM);
                setSaved(false);
              },
            })
          }
        />
      ) : null}
    </Card>
  );

  return (
    <Screen
      wide
      insetTop={false}
      title={t('measurements.title')}
      subtitle={t('measurements.subtitle')}>
      {query.data?.offline ? (
        <View style={styles.notice}>
          <CloudOff color={colors.warning} size={16} aria-hidden />
          <AppText variant="caption" tone="muted" style={styles.flex}>
            {t('measurements.offline')}
          </AppText>
        </View>
      ) : null}

      <Columns>
        {[
          <View key="form" style={styles.stack}>
            {formCard}
          </View>,
          <View key="progress" style={styles.stack}>
            {field ? (
              <Card style={styles.card}>
                <View style={styles.chips} role="radiogroup" aria-label={t('measurements.show')}>
                  {available.map((item) => (
                    <Chip
                      key={item}
                      role="radio"
                      label={t(`measurements.fields.${item}`)}
                      selected={item === field}
                      onPress={() => setChosen(item)}
                    />
                  ))}
                </View>
                <View style={styles.stats}>
                  {latest ? (
                    <View style={styles.stat}>
                      <AppText variant="caption" tone="muted">
                        {t('measurements.latest', {
                          date: formatShortDate(toLocalDate(latest.date), language),
                        })}
                      </AppText>
                      <AppText variant="heading">{format(field, latest.value)}</AppText>
                    </View>
                  ) : null}
                  <View style={styles.stat}>
                    <AppText variant="caption" tone="muted">
                      {t('measurements.trend')}
                    </AppText>
                    <AppText variant="heading">
                      {trend
                        ? `${trend.change > 0 ? '+' : trend.change < 0 ? '−' : ''}${format(field, Math.abs(trend.change))}`
                        : '—'}
                    </AppText>
                  </View>
                </View>
                {plotted.length > 1 ? (
                  <LineChart
                    title={t('measurements.chartTitle', {
                      field: t(`measurements.fields.${field}`),
                    })}
                    data={plotted.map((point) => ({
                      label: formatShortDate(toLocalDate(point.date), language),
                      value: point.value,
                    }))}
                    formatValue={(value) => format(field, value)}
                    formatTick={(value) => formatNumber(value, language)}
                  />
                ) : (
                  <AppText tone="muted">{t('measurements.needTwo')}</AppText>
                )}
                <AppText variant="caption" tone="muted">
                  {field === 'weightKg'
                    ? t('measurements.weightHint')
                    : t('measurements.trendHint')}
                </AppText>
              </Card>
            ) : (
              <EmptyState
                icon={Ruler}
                title={t('measurements.emptyTitle')}
                description={t('measurements.emptyDescription')}
              />
            )}

            {measurements.length > 0 ? (
              <Card style={styles.card}>
                <AppText variant="heading" role="heading">
                  {t('measurements.history')}
                </AppText>
                {measurements.slice(0, HISTORY_SHOWN).map((entry) => (
                  <HistoryRow
                    key={entry.date}
                    label={formatMediumDate(toLocalDate(entry.date), language)}
                    summary={MEASUREMENT_FIELDS.filter(
                      (item) => entry[item] !== null && entry[item] !== undefined,
                    )
                      .map(
                        (item) =>
                          `${t(`measurements.short.${item}`)} ${format(item, entry[item]!)}`,
                      )
                      .join(' · ')}
                    onPress={() => load(entry)}
                    editLabel={t('measurements.editDay', {
                      date: formatMediumDate(toLocalDate(entry.date), language),
                    })}
                  />
                ))}
              </Card>
            ) : null}
          </View>,
        ]}
      </Columns>
    </Screen>
  );
}

function HistoryRow({
  label,
  summary,
  onPress,
  editLabel,
}: {
  label: string;
  summary: string;
  onPress: () => void;
  editLabel: string;
}) {
  const { hovered, hoverProps } = useHover();
  return (
    <Pressable
      role="button"
      aria-label={`${editLabel}. ${summary}`}
      onPress={onPress}
      {...hoverProps}
      style={[styles.historyRow, hovered && styles.historyRowHovered]}>
      <AppText variant="label" style={styles.historyDate}>
        {label}
      </AppText>
      <AppText variant="caption" tone="muted" style={styles.flex}>
        {summary}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stack: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 130,
    gap: spacing.xs,
  },
  input: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  historyRow: {
    cursor: 'pointer',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    minHeight: minTouchTarget,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: radius.sm,
  },
  historyRowHovered: {
    backgroundColor: colors.surface2,
  },
  historyDate: {
    width: 104,
  },
});
