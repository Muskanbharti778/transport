import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from './AppText';
import {AppButton} from './AppButton';
import {colors, radius, spacing} from '../../theme';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateInput(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date && !isNaN(dateStr.getTime())) return dateStr;

  const str = String(dateStr).trim();

  // Format: "25 Aug 2026" or "25 August 2026" or "25-Aug-2026"
  const namedMatch = str.match(/^(\d{1,2})[\s\-]+([A-Za-z]+)[\s\-]+(\d{4})/);
  if (namedMatch) {
    const day = parseInt(namedMatch[1], 10);
    const monthPrefix = namedMatch[2].toLowerCase().slice(0, 3);
    const year = parseInt(namedMatch[3], 10);
    const monthIdx = SHORT_MONTHS.findIndex(m => m.toLowerCase() === monthPrefix);
    if (monthIdx !== -1) {
      return new Date(year, monthIdx, day);
    }
  }

  // Format: "DD/MM/YYYY" or "DD-MM-YYYY"
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  // Standard ISO or string parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return new Date();
}

function formatDate(day, monthIndex, year) {
  return `${day} ${SHORT_MONTHS[monthIndex]} ${year}`;
}

export function DatePickerModal({
  visible,
  initialDate,
  onSelectDate,
  onClose,
  title = 'Select Date',
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Sync date when modal becomes visible or initialDate changes
  useEffect(() => {
    if (visible) {
      const parsed = parseDateInput(initialDate);
      setCurrentMonth(parsed.getMonth());
      setCurrentYear(parsed.getFullYear());
      setSelectedDay(parsed.getDate());
    }
  }, [visible, initialDate]);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOffset = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      const newYear = currentYear - 1;
      const newMonth = 11;
      const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      if (selectedDay > maxDays) setSelectedDay(maxDays);
    } else {
      const newMonth = currentMonth - 1;
      const maxDays = new Date(currentYear, newMonth + 1, 0).getDate();
      setCurrentMonth(newMonth);
      if (selectedDay > maxDays) setSelectedDay(maxDays);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      const newYear = currentYear + 1;
      const newMonth = 0;
      const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      if (selectedDay > maxDays) setSelectedDay(maxDays);
    } else {
      const newMonth = currentMonth + 1;
      const maxDays = new Date(currentYear, newMonth + 1, 0).getDate();
      setCurrentMonth(newMonth);
      if (selectedDay > maxDays) setSelectedDay(maxDays);
    }
  };

  const handleSelectDay = d => {
    setSelectedDay(d);
  };

  const handleConfirm = () => {
    const formatted = formatDate(selectedDay, currentMonth, currentYear);
    onSelectDate?.(formatted);
    onClose?.();
  };

  const handleSetPreset = type => {
    const target = new Date();
    if (type === 'yesterday') {
      target.setDate(target.getDate() - 1);
    } else if (type === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    }
    const day = target.getDate();
    const month = target.getMonth();
    const year = target.getFullYear();

    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDay(day);

    const formatted = formatDate(day, month, year);
    onSelectDate?.(formatted);
    onClose?.();
  };

  // Build grid of day slots
  const daySlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < firstDayOffset; i++) {
      slots.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      slots.push(d);
    }
    return slots;
  }, [firstDayOffset, daysInMonth]);

  const activeDay = selectedDay > daysInMonth ? daysInMonth : selectedDay;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}>
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity activeOpacity={1} style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <AppText variant="heading" style={styles.cardTitle}>
                {title}
              </AppText>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel="Close Calendar">
                <Icon name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleSetPreset('yesterday')}
                activeOpacity={0.7}>
                <AppText variant="caption" style={styles.presetText}>
                  Yesterday
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetChip, styles.presetChipActive]}
                onPress={() => handleSetPreset('today')}
                activeOpacity={0.7}>
                <AppText variant="caption" style={styles.presetTextActive}>
                  Today
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleSetPreset('tomorrow')}
                activeOpacity={0.7}>
                <AppText variant="caption" style={styles.presetText}>
                  Tomorrow
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Month Year Navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={styles.navBtn}
                accessibilityLabel="Previous Month">
                <Icon name="chevron-left" size={24} color={colors.text} />
              </TouchableOpacity>
              <AppText variant="heading" style={styles.monthYearText}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </AppText>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.navBtn}
                accessibilityLabel="Next Month">
                <Icon name="chevron-right" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Days of Week Row */}
            <View style={styles.daysHeader}>
              {DAYS_OF_WEEK.map(d => (
                <AppText key={d} variant="caption" color="textMuted" style={styles.dayHeaderCell}>
                  {d}
                </AppText>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {daySlots.map((slot, index) => {
                if (slot === null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const isSelected = slot === activeDay;
                return (
                  <TouchableOpacity
                    key={`day-${slot}`}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                    onPress={() => handleSelectDay(slot)}
                    activeOpacity={0.7}>
                    <AppText
                      variant="body"
                      style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                      {slot}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm Button */}
            <AppButton
              title={`Confirm (${activeDay} ${SHORT_MONTHS[currentMonth]} ${currentYear})`}
              onPress={handleConfirm}
              style={styles.confirmBtn}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    width: '100%',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  presetText: {
    fontWeight: '600',
    color: colors.text,
  },
  presetTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  navBtn: {
    padding: spacing.xs,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '700',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeaderCell: {
    width: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmBtn: {
    marginTop: spacing.xs,
    height: 44,
  },
});
