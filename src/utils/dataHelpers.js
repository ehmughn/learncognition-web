export function findModule(moduleId, modules = []) {
  return modules.find((item) => item.id === moduleId) ?? null;
}

export function findStudent(studentId, students = []) {
  return students.find((item) => item.id === studentId) ?? null;
}

export function getModuleView(moduleId, drafts, modules = []) {
  const base = findModule(moduleId, modules);
  if (!base) return null;
  const draft = drafts?.[moduleId];
  if (!draft) return base;
  return {
    ...base,
    ...draft,
    stats: base.stats,
    code: base.code,
    students: base.students,
  };
}
