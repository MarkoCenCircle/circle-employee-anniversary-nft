export function getYearsElapsed(fromDate: Date) {
    const diffMs = (Date.now() - fromDate.getTime()) / 1000;
    const diffDays = diffMs / (60 * 60 * 24);
    return Math.abs(Math.floor(diffDays / 365));
}

export function dateToUnixSeconds(date: Date) {
    return Math.floor(date.getTime() / 1000);
}

export function unixSecondsToDate(unixSeconds: number) {
    return new Date(unixSeconds * 1000)
}
