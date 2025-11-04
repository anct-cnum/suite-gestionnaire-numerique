import OpeningHours from 'opening_hours'

export enum WeekDay {
  Friday = 5,
  Monday = 1,
  Saturday = 6,
  Sunday = 0,
  Thursday = 4,
  Tuesday = 2,
  Wednesday = 3
}

export type WeekOpeningHours = Record<WeekDay, Array<{ end: Time; start: Time; startAM: boolean }>>

type Time = `${0 | 1 | 2}${Digit}:${0 | 1 | 2 | 3 | 4 | 5}${Digit}`

type Digit = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`

const MINUTE_TO_MILLISECONDS: number = 60 * 1000
const HOUR_TO_MILLISECONDS: number = 60 * MINUTE_TO_MILLISECONDS
const DAY_TO_MILLISECONDS: number = 24 * HOUR_TO_MILLISECONDS

function dayOfTheWeek(date: Date, weekDay: WeekDay): Date {
  return new Date(date.getTime() + ((weekDay === WeekDay.Sunday ? 7 : weekDay) - date.getDay()) * DAY_TO_MILLISECONDS)
}

function firstTimeOfTheDay(date: Date): Date {
  const dateWithoutTime = new Date(date)
  dateWithoutTime.setHours(0, 0, 0, 0)
  return dateWithoutTime
}

function lastTimeOfTheDay(date: Date): Date {
  const dateWithoutTime = new Date(date)
  dateWithoutTime.setHours(23, 59, 59, 999)
  return dateWithoutTime
}

function formatHour(date: Date): Time {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` as Time
}

function appendTimeTableInterval(
  timeTableOpeningHours: WeekOpeningHours,
  intervalEnd: Date,
  intervalStart: Date,
  weekDay: WeekDay
): WeekOpeningHours {
  return {
    ...timeTableOpeningHours,
    [weekDay]: [
      ...timeTableOpeningHours[weekDay],
      {
        end: formatHour(intervalEnd),
        start: formatHour(intervalStart),
        startAM: intervalStart.getHours() < 12,
      },
    ],
  }
}

function firstDayOfTheWeek(date: Date): Date {
  return dayOfTheWeek(date, WeekDay.Monday)
}

function lastDayOfTheWeek(date: Date): Date {
  return dayOfTheWeek(date, WeekDay.Sunday)
}

const initialTimeTableOpeningHours: WeekOpeningHours = {
  [WeekDay.Friday]: [],
  [WeekDay.Monday]: [],
  [WeekDay.Saturday]: [],
  [WeekDay.Sunday]: [],
  [WeekDay.Thursday]: [],
  [WeekDay.Tuesday]: [],
  [WeekDay.Wednesday]: [],
}

export function parseWeekOsmOpeningHours(date: Date) {
  return (horairesOSM?: string): undefined | WeekOpeningHours => {
    if (horairesOSM === undefined || horairesOSM === '') {
      return undefined
    }

    try {
      return new OpeningHours(horairesOSM, null)
        .getOpenIntervals(firstTimeOfTheDay(firstDayOfTheWeek(date)), lastTimeOfTheDay(lastDayOfTheWeek(date)))
        .reduce(
          (
            timeTableOpeningHours: WeekOpeningHours,
            [intervalStart, intervalEnd]: [Date, Date, boolean, string | undefined]
          ): WeekOpeningHours =>
            appendTimeTableInterval(
              timeTableOpeningHours,
              intervalEnd,
              intervalStart,
              intervalStart.getDay() as WeekDay
            ),
          initialTimeTableOpeningHours
        )
    } catch {
      return undefined
    }
  }
}

export function openingState(date: Date) {
  return (horairesOSM?: string): OpeningState | undefined => {
    if (horairesOSM === undefined || horairesOSM === '') {
      return undefined
    }

    try {
      const openingHours = new OpeningHours(horairesOSM)
      return openingHoursState(date, openingHours) ? openState(date, openingHours) : closeState(date, openingHours)
    } catch {
      return undefined
    }
  }
}

export function getComment(horairesOSM: string): string | undefined {
  if (horairesOSM === '') {
    return undefined
  }

  try {
    return new OpeningHours(horairesOSM).getComment()
  } catch {
    return undefined
  }
}

type OpeningState = CloseState | OpenState

interface OpenState {
  isOpen: true
  time: Date | undefined
}

interface CloseState {
  day: number
  isOpen: false
  time: Date | undefined
}

function openingHoursState(date: Date, openingHours: OpeningHours): boolean {
  return openingHours.getIterator(date).getState()
}

function nextOpeningDay(date: Date, openingHours: OpeningHours): number {
  const nextChange = openingHours.getNextChange(date)
  if (date.toDateString() === nextChange?.toDateString()) {
    return date.getDay()
  }
  return (nextChange?.getDay() as undefined | WeekDay) ?? WeekDay.Sunday
}

function closeState(date: Date, openingHours: OpeningHours): CloseState {
  return {
    day: nextOpeningDay(date, openingHours),
    isOpen: false,
    time: openingHours.getNextChange(date),
  }
}

function openState(date: Date, openingHours: OpeningHours): OpenState {
  return {
    isOpen: true,
    time: openingHours.getNextChange(date),
  }
}
