const millisPerDay = 86_400_000

export const epochTimeMinusTwoDays: Date = new Date(-millisPerDay * 2)

export const epochTimeMinusOneDay: Date = new Date(-millisPerDay)

export const epochTime: Date = new Date(0)

export const epochTimePlusOneDay: Date = new Date(millisPerDay)

export const invalidDate: Date = new Date(NaN)
