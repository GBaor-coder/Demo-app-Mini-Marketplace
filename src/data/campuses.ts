export const CAMPUSES: string[] = [
  'Trường Đại học Đồng Tháp',
  'Đại học Bách Khoa TP.HCM',
  'Đại học Khoa học Tự nhiên TP.HCM',
  'Đại học Kinh tế TP.HCM',
  'Đại học Sư phạm TP.HCM',
  'Đại học Sư phạm Kỹ thuật TP.HCM',
  'Đại học Cần Thơ',
  'Đại học Công nghiệp TP.HCM',
  'Đại học Công nghệ TP.HCM (HUTECH)',
  'Đại học Tôn Đức Thắng',
  'Đại học Quốc tế (ĐHQG TP.HCM)',
  'Đại học Ngoại thương',
  'Đại học Kinh tế Quốc dân',
  'Đại học Bách khoa Hà Nội',
  'Đại học Xây dựng Hà Nội',
  'Đại học Sư phạm Hà Nội',
  'Đại học Y Dược TP.HCM',
  'Đại học Mở TP.HCM',
  'Đại học Văn Lang',
  'Đại học FPT',
  'Đại học RMIT Việt Nam',
  'Học viện Nông nghiệp Việt Nam',
  'Đại học Nông Lâm TP.HCM',
  'Đại học Giao thông Vận tải TP.HCM',
  'Đại học Ngân hàng TP.HCM',
  'Trường Cao đẳng FPT Polytechnic',
];

export function filterCampuses(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return CAMPUSES.slice(0, limit);
  return CAMPUSES.filter((name) => name.toLowerCase().includes(q)).slice(0, limit);
}