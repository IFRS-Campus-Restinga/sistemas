export function groupByPeriod(curriculum: any[]): number[] {
    const periodsSet = new Set<number>();

    curriculum.forEach((subject) => {
        if (typeof subject.period === 'number') {
            periodsSet.add(subject.period);
        }
    });

    const result = Array.from(periodsSet).sort((a, b) => a - b);
    return result
}
