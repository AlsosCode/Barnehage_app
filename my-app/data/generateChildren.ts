const firstNames = [
  "Emma",
  "Olivia",
  "Noah",
  "Lucas",
  "Sofie",
  "Ella",
  "Jakob",
  "Aksel",
  "Hanna",
  "Maja",
];
const groups = ["Bjørnehiet", "Revehiet", "Ekornskogen", "Uglebo", "Solstua"];

function createRandomChild(id: number) {
  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  const age = Math.floor(Math.random() * 3) + 3; // 3-5 år
  const group = groups[Math.floor(Math.random() * groups.length)];

  return { id, name, age, group };
}

export function generateChildren(amount: number) {
  const list = [] as { id: number; name: string; age: number; group: string }[];
  for (let i = 1; i <= amount; i++) {
    list.push(createRandomChild(i));
  }
  return list;
}
