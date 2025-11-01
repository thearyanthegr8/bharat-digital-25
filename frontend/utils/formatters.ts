// utils/formatters.ts
export function formatMonthShort(month: string): string {
  const monthMap: { [key: string]: string } = {
    Jan: "जन",
    Feb: "फ़र",
    March: "मार्च",
    April: "अप्रैल",
    May: "मई",
    June: "जून",
    July: "जुल",
    Aug: "अग",
    Sep: "सित",
    Oct: "अक्टू",
    Nov: "नव",
    Dec: "दिस",
  };
  return monthMap[month] || month;
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) {
    return "N/A";
  }
  return num.toLocaleString("hi-IN");
}
