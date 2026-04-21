import { modulesSeed } from "../constants/modules.js";
import { studentsSeed } from "../constants/students.js";

export function findModule(moduleId) {
  return modulesSeed.find((item) => item.id === moduleId) ?? modulesSeed[0];
}

export function findStudent(studentId) {
  return studentsSeed.find((item) => item.id === studentId) ?? studentsSeed[0];
}

export function getModuleView(moduleId, drafts) {
  const base = findModule(moduleId);
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
