import type { Chapter } from '../types';

const loremContent = (chapterNum: number, title: string) => `
${title}

Ánh nắng ban mai xuyên qua kẽ lá, rọi xuống con đường mòn giữa rừng xanh. Đây là buổi sáng của một ngày mới, một ngày mà mọi thứ sẽ thay đổi mãi mãi.

Nhân vật chính đứng lặng yên, cảm nhận từng luồng linh khí trong không khí. Sau bao năm tháng gian khổ, giờ đây anh ta mới thực sự hiểu được ý nghĩa của việc tu luyện — không phải để có được sức mạnh, mà để hiểu bản thân mình.

"Sức mạnh không phải là tất cả," anh ta thì thầm với chính mình, ánh mắt hướng về phía chân trời xa xăm. "Nhưng nếu không có sức mạnh, ngươi sẽ không thể bảo vệ những gì quan trọng nhất."

Tiếng bước chân từ phía sau khiến anh ta giật mình quay lại. Một bóng người xuất hiện giữa làn sương sớm — cao lớn, mặc bào phục trắng, tóc bạc như tuyết dù còn trẻ tuổi. Đây là đối thủ mà anh ta đã chờ đợi từ lâu.

"Lâu rồi không gặp," người đến nói, giọng điềm tĩnh nhưng mang theo uy áp khó tả. "Ngươi đã mạnh hơn nhiều so với lần trước chúng ta đối mặt."

"Và ngươi thì sao?" anh ta đáp lại, ánh mắt sắc bén quan sát từng cử chỉ nhỏ của đối phương. "Ngươi cũng đã đột phá rồi phải không?"

Một nụ cười thoáng qua trên môi người đến. "Ta đã đột phá từ lâu. Hôm nay ta đến không phải để chiến đấu. Ta có điều muốn nói với ngươi — điều mà ngươi phải biết trước khi quá muộn."

Chương ${chapterNum} tiếp tục câu chuyện với những tình tiết gay cấn hơn, khi bí mật về xuất thân của nhân vật chính dần dần được hé lộ. Những sự kiện tưởng chừng ngẫu nhiên hóa ra đều có mối liên hệ với nhau, đan xen thành một mạng lưới phức tạp mà cả hai người họ đều chỉ là những quân cờ nhỏ trong một ván cờ lớn hơn nhiều.

Cuối buổi sáng hôm đó, sau khi người bí ẩn rời đi, nhân vật chính ngồi lặng yên bên dòng suối nhỏ. Tiếng nước chảy nhẹ nhàng như đang kể chuyện về những ngày tháng đã qua — những gian khổ, những mất mát, và những người bạn đồng hành đã rời xa.

Nhưng anh ta không bi quan. Trong lòng anh ta, một ngọn lửa vẫn đang cháy — ngọn lửa của hy vọng, của ý chí và của tình yêu với những người còn đang chờ anh ta trở về.

"Ta sẽ không bỏ cuộc," anh ta nói với chính mình, nắm chặt bàn tay. "Dù trước mặt có ngàn trở ngại, ta cũng sẽ vượt qua."

Và thế là, chương mới trong cuộc hành trình của anh ta bắt đầu...
`.trim();

const generateChapters = (storyId: string, count: number): Chapter[] => {
  const chapters: Chapter[] = [];
  for (let i = 1; i <= count; i++) {
    const title = i === 1 ? 'Khởi đầu mới' :
      i === 2 ? 'Gặp gỡ định mệnh' :
      i === 3 ? 'Bí mật hé lộ' :
      i === 4 ? 'Cuộc chiến đầu tiên' :
      `Chương ${i}: Hành trình tiếp diễn`;

    chapters.push({
      id: `${storyId}-ch${i}`,
      storyId,
      number: i,
      title,
      content: loremContent(i, title),
      wordCount: 1800 + Math.floor(Math.random() * 800),
      publishedAt: new Date(Date.now() - (count - i) * 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return chapters;
};

// Generate 5 chapters for each of the first 10 stories (lazy, rest fetched on demand)
export const mockChapters: Record<string, Chapter[]> = {
  'td-001': generateChapters('td-001', 5),
  'tth-002': generateChapters('tth-002', 5),
  'bgd-003': generateChapters('bgd-003', 5),
  'dts-004': generateChapters('dts-004', 5),
  'nt-005': generateChapters('nt-005', 5),
  'nt-006': generateChapters('nt-006', 5),
  'nt-007': generateChapters('nt-007', 5),
  'dt-008': generateChapters('dt-008', 5),
  'dt-009': generateChapters('dt-009', 5),
  'kh-010': generateChapters('kh-010', 5),
  'kh-011': generateChapters('kh-011', 5),
  'kh-012': generateChapters('kh-012', 5),
  'dg-013': generateChapters('dg-013', 5),
  'dg-014': generateChapters('dg-014', 5),
  'ts-015': generateChapters('ts-015', 5),
  'ts-016': generateChapters('ts-016', 5),
  'hh-017': generateChapters('hh-017', 5),
  'hh-018': generateChapters('hh-018', 5),
  'khvt-019': generateChapters('khvt-019', 5),
  'khvt-020': generateChapters('khvt-020', 5),
  'tien-021': generateChapters('tien-021', 5),
  'nt-022': generateChapters('nt-022', 5),
  'dt-023': generateChapters('dt-023', 5),
  'ts-024': generateChapters('ts-024', 5),
  'hh-025': generateChapters('hh-025', 5),
  'kh-026': generateChapters('kh-026', 5),
  'dg-027': generateChapters('dg-027', 5),
  'tien-028': generateChapters('tien-028', 5),
  'nt-029': generateChapters('nt-029', 5),
  'dt-030': generateChapters('dt-030', 5),
};

export const getChapters = (storyId: string): Chapter[] => {
  return mockChapters[storyId] || generateChapters(storyId, 5);
};

export const getChapter = (storyId: string, chapterNumber: number): Chapter | undefined => {
  const chapters = getChapters(storyId);
  return chapters.find(c => c.number === chapterNumber);
};
