/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessDayConfig } from './types.ts';

/**
 * Standard Default US & Global Market Holidays (YYYY-MM-DD format)
 * Platform admin can configure and augment these in system settings.
 */
export const DEFAULT_PLATFORM_HOLIDAYS = [
  '2026-01-01', // New Year's Day
  '2026-01-19', // Martin Luther King Jr. Day
  '2026-02-16', // Washington's Birthday / Presidents Day
  '2026-05-25', // Memorial Day
  '2026-06-19', // Juneteenth National Independence Day
  '2026-07-03', // Independence Day (Observed)
  '2026-07-04', // Independence Day
  '2026-09-07', // Labor Day
  '2026-10-12', // Columbus Day
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving Day
  '2026-12-25', // Christmas Day
];

/**
 * Checks if a given Date instance falls on a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Formats a Date into ISO date string YYYY-MM-DD
 */
export function formatIsoDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if a given Date is a designated public holiday
 */
export function isHoliday(date: Date, holidays: string[]): boolean {
  const dateStr = formatIsoDateString(date);
  return holidays.includes(dateStr);
}

/**
 * Checks if a given day is a valid business banking day
 */
export function isBusinessDay(date: Date, holidays: string[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Calculates the exact release eligibility date given a confirmation timestamp
 * and the configured business-day holding period (default: 3 business days).
 *
 * Example:
 * - Confirmed on Thursday 14:00:
 *   - Day 1: Friday
 *   - Day 2: Monday (skipping Sat & Sun)
 *   - Day 3: Tuesday (Release eligibility date at or after 14:00)
 */
export function calculateReleaseEligibilityDate(
  confirmationDate: Date | string,
  config: BusinessDayConfig = {
    holdingPeriodBusinessDays: 3,
    timezone: 'UTC',
    holidays: DEFAULT_PLATFORM_HOLIDAYS,
  }
): {
  eligibilityDate: Date;
  businessDaysCounted: number;
  calendarDaysElapsed: number;
  excludedDates: Array<{ date: string; reason: 'weekend' | 'holiday' }>;
} {
  const start = new Date(confirmationDate);
  const current = new Date(start);
  const excludedDates: Array<{ date: string; reason: 'weekend' | 'holiday' }> = [];
  let businessDaysRemaining = config.holdingPeriodBusinessDays;

  // Advance day by day until the required business days have been satisfied
  while (businessDaysRemaining > 0) {
    current.setUTCDate(current.getUTCDate() + 1);

    if (isWeekend(current)) {
      excludedDates.push({ date: formatIsoDateString(current), reason: 'weekend' });
    } else if (isHoliday(current, config.holidays)) {
      excludedDates.push({ date: formatIsoDateString(current), reason: 'holiday' });
    } else {
      businessDaysRemaining--;
    }
  }

  const calendarDaysElapsed = Math.round(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    eligibilityDate: current,
    businessDaysCounted: config.holdingPeriodBusinessDays,
    calendarDaysElapsed,
    excludedDates,
  };
}

/**
 * Rechecks whether an order's release period has officially expired
 * and whether it is legally eligible for Stripe transfer.
 */
export function isTransferEligibleNow(
  releaseEligibilityDate: Date | string,
  currentSimulatedTime?: Date | string
): boolean {
  const now = currentSimulatedTime ? new Date(currentSimulatedTime) : new Date();
  const target = new Date(releaseEligibilityDate);
  return now.getTime() >= target.getTime();
}
