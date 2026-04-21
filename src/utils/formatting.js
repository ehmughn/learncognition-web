export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateOnly(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function shortDescription(text, length = 30) {
  return text.length <= length ? text : `${text.slice(0, length).trimEnd()}...`;
}

export function makeCode(length = 10) {
  const digits = "0123456789";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += digits[Math.floor(Math.random() * digits.length)];
  }
  return result;
}
