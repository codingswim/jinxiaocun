import dayjs from 'dayjs';

// 金额格式化（保留两位小数 + 千分位）
export function formatMoney(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '0.00';
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 日期格式化
export function formatDate(
  date: string | number | Date | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

export default { formatMoney, formatDate };
