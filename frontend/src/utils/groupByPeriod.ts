export function groupByPeriod(curriculum: any[]) {
    const grouped: Record<number, any[]> = {};

    curriculum.forEach((subject) => {
        if (!grouped[subject.period]) {
            grouped[subject.period] = [];
        }
        grouped[subject.period].push(subject);
    });

    const periods = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    return {
        grouped,
        periods
    };
}
