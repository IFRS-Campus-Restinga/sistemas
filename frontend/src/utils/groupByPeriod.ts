import type { CurriculumInterface } from "../services/ppcService";

export function groupByPeriod(curriculum: CurriculumInterface[]): number[] {
    const periodsSet = new Set<number>();

    curriculum.forEach((subject) => {
        if (typeof subject.period === 'number') {
            periodsSet.add(subject.period);
        }
    });

    const result = Array.from(periodsSet).sort((a, b) => a - b);

    return result
}

export function groupSubjectsByPeriod(curriculum: any[]) {
  const grouped: Record<string, any> = {};

  curriculum.forEach((item) => {
    const period = item.period; // string
    const subjectName = item.subject.name;
    const preReqs = item.pre_requisits?.map((pr: any) => pr.id) || [];

    if (!grouped[period]) {
      grouped[period] = [];
    }

    grouped[period].push({
      name: subjectName,
      preRequisits: preReqs
    });
  });

  // transforma o objeto em array no formato desejado
  return Object.keys(grouped).map((period) => ({
    period: period, // mantém como string
    subjects: grouped[period]
  }));
}
