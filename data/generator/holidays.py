from datetime import datetime, timedelta

US_HOLIDAYS = {
    "New Year": (1, 1),
    "MLK Day": (2, 1, 0),
    "Presidents Day": (2, 2, 0),
    "Memorial Day": (-1, 5, 0),
    "Independence Day": (7, 4),
    "Labor Day": (0, 9, 0),
    "Columbus Day": (1, 10, 0),
    "Veterans Day": (11, 11),
    "Thanksgiving": (3, 11, 3),
    "Christmas": (12, 25),
}

def get_nth_weekday_of_month(year, nth, month, weekday):
    count = 0
    for day in range(1, 32):
        try:
            d = datetime(year, month, day)
            if d.weekday() == weekday:
                count += 1
                if count == nth:
                    return d
        except ValueError:
            break
    return None

def get_last_weekday_of_month(year, month, weekday):
    for day in range(31, 0, -1):
        try:
            d = datetime(year, month, day)
            if d.weekday() == weekday:
                return d
        except ValueError:
            break
    return None

def is_holiday(dt: datetime) -> bool:
    y = dt.year
    for name, rule in US_HOLIDAYS.items():
        if len(rule) == 2:
            m, d = rule
            if dt.month == m and dt.day == d:
                return True
        elif rule[0] == 0:
            _, m, w = rule
            first_day = datetime(y, m, 1)
            days_ahead = w - first_day.weekday()
            if days_ahead < 0:
                days_ahead += 7
            holiday = first_day + timedelta(days=days_ahead)
            if dt.date() == holiday.date():
                return True
        elif rule[0] == -1:
            _, m, w = rule
            holiday = get_last_weekday_of_month(y, m, w)
            if holiday and dt.date() == holiday.date():
                return True
        elif rule[0] == 1:
            _, m, w = rule
            holiday = get_nth_weekday_of_month(y, 2, m, w)
            if holiday and dt.date() == holiday.date():
                return True
        elif rule[0] == 2:
            _, m, w = rule
            holiday = get_nth_weekday_of_month(y, 3, m, w)
            if holiday and dt.date() == holiday.date():
                return True
        elif rule[0] == 3:
            _, m, w = rule
            holiday = get_nth_weekday_of_month(y, 4, m, w)
            if holiday and dt.date() == holiday.date():
                return True
    return False
