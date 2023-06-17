function getKey(type) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return type + startOfDay.toString();
}

export function storeData(type, data) {
  localStorage.setItem(getKey(type), JSON.stringify(data));
}

export function loadData(type) {
  return JSON.parse(localStorage.getItem(getKey(type)) ?? '[]');
}
