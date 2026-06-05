import { PrismaClient, Genre, StoryStatus } from '@prisma/client';

const prisma = new PrismaClient();

const genreMap: Record<string, Genre> = {
  'tien-hiep': 'TIEN_HIEP', 'ngon-tinh': 'NGON_TINH', 'do-thi': 'DO_THI',
  'kiem-hiep': 'KIEM_HIEP', 'di-gioi': 'DI_GIOI', 'trong-sinh': 'TRONG_SINH',
  'huyen-huyen': 'HUYEN_HUYEN', 'khoa-hoc-vien-tuong': 'KHOA_HOC_VIEN_TUONG',
};
const statusMap: Record<string, StoryStatus> = {
  ongoing: 'ONGOING', completed: 'COMPLETED', hiatus: 'HIATUS',
};

const stories = [
  { id: 'td-001', title: 'Đấu Phá Thương Khung', author: 'Thiên Tàm Thổ Đậu', cover: 'https://picsum.photos/seed/story1/300/400', genre: 'tien-hiep', tags: ['Tu tiên', 'Phấn đấu', 'Chiến đấu', 'Đan dược'], description: 'Thiếu niên Tiêu Viêm vốn là một thiên tài tuyệt thế, nhưng đột nhiên mất đi toàn bộ tài năng tu luyện.', status: 'completed', totalChapters: 1648, views: 9800000, rating: 4.8, ratingCount: 12400, isFeatured: true, isHot: true },
  { id: 'tth-002', title: 'Tu Chân Giới', author: 'Vong Ngữ', cover: 'https://picsum.photos/seed/story2/300/400', genre: 'tien-hiep', tags: ['Tu tiên', 'Thần thông', 'Bảo bối'], description: 'Hàn Lập, một thanh niên bình thường từ làng quê nghèo, tình cờ bước vào thế giới tu chân.', status: 'completed', totalChapters: 2008, views: 8200000, rating: 4.9, ratingCount: 15600, isFeatured: true, isHot: true },
  { id: 'bgd-003', title: 'Bạch Giang Đồ', author: 'Nhĩ Căn', cover: 'https://picsum.photos/seed/story3/300/400', genre: 'tien-hiep', tags: ['Tu tiên', 'Hệ thống', 'Mạnh mẽ'], description: 'Vương Lâm, kẻ tầm thường nhất lớp, vô tình nhận được chiếc nhẫn kỳ lạ.', status: 'ongoing', totalChapters: 3102, views: 7500000, rating: 4.7, ratingCount: 9800, isHot: true },
  { id: 'dts-004', title: 'Đấu Thiên', author: 'Mặc Thấp Thanh Thành', cover: 'https://picsum.photos/seed/story4/300/400', genre: 'tien-hiep', tags: ['Tu tiên', 'Vũ khí thần'], description: 'Tần Vũ, một thiếu niên bình dị, vô tình thức tỉnh Thần Phủ.', status: 'completed', totalChapters: 1500, views: 6200000, rating: 4.6, ratingCount: 8200 },
  { id: 'nt-005', title: 'Cẩm Tú Vị Ương', author: 'Phỉ Ngã Tư Tồn', cover: 'https://picsum.photos/seed/story5/300/400', genre: 'ngon-tinh', tags: ['Cung đấu', 'Cổ đại', 'Xuyên không'], description: 'Thẩm Vy xuyên không vào cổ đại, trở thành phi tần trong hậu cung.', status: 'completed', totalChapters: 312, views: 4500000, rating: 4.5, ratingCount: 6700, isFeatured: true },
  { id: 'nt-006', title: 'Thiên Kim Quy Lai', author: 'Bắc Lịch Quân', cover: 'https://picsum.photos/seed/story6/300/400', genre: 'ngon-tinh', tags: ['Trọng sinh', 'Đô thị', 'Ngôn tình'], description: 'Tống Hy trọng sinh trở lại, quyết tâm không để lịch sử bi thảm lặp lại.', status: 'ongoing', totalChapters: 456, views: 3800000, rating: 4.4, ratingCount: 5400, isHot: true },
  { id: 'nt-007', title: 'Tổng Tài Thâm Tình', author: 'Tiểu Tiểu Nhất', cover: 'https://picsum.photos/seed/story7/300/400', genre: 'ngon-tinh', tags: ['Hiện đại', 'Tổng tài', 'Ngọt ngào'], description: 'Gặp gỡ anh trong một đêm say, rồi lại vô tình trở thành thư ký của anh.', status: 'completed', totalChapters: 280, views: 2900000, rating: 4.3, ratingCount: 4200 },
  { id: 'dt-008', title: 'Đô Thị Siêu Phẩm', author: 'Không Linh Tử', cover: 'https://picsum.photos/seed/story8/300/400', genre: 'do-thi', tags: ['Đô thị', 'Tu tiên', 'Y thuật'], description: 'Từ núi cao xuống thành phố, Lâm Phong mang theo y thuật thần kỳ.', status: 'ongoing', totalChapters: 2340, views: 5600000, rating: 4.2, ratingCount: 7800, isHot: true },
  { id: 'dt-009', title: 'Trọng Sinh Đô Thị Cuồng Tiên', author: 'Phong Vũ Kiếm', cover: 'https://picsum.photos/seed/story9/300/400', genre: 'do-thi', tags: ['Trọng sinh', 'Dị năng'], description: 'Tiên nhân trọng sinh, mang theo ký ức ngàn năm tu luyện trở về thời trẻ.', status: 'ongoing', totalChapters: 1876, views: 4200000, rating: 4.1, ratingCount: 6100 },
  { id: 'kh-010', title: 'Cô Đơn Hiệp Khách', author: 'Kim Dung', cover: 'https://picsum.photos/seed/story10/300/400', genre: 'kiem-hiep', tags: ['Kiếm hiệp', 'Giang hồ'], description: 'Lệnh Hồ Xung, đệ tử phái Hoa Sơn, vô tình học được võ công bí truyền.', status: 'completed', totalChapters: 220, views: 3200000, rating: 4.9, ratingCount: 11200, isFeatured: true },
  { id: 'kh-011', title: 'Thiên Long Bát Bộ', author: 'Kim Dung', cover: 'https://picsum.photos/seed/story11/300/400', genre: 'kiem-hiep', tags: ['Kiếm hiệp', 'Anh hùng'], description: 'Ba nhân vật chính: Kiều Phong, Hư Trúc và Đoàn Dự, mỗi người mang một số phận riêng.', status: 'completed', totalChapters: 349, views: 5800000, rating: 4.95, ratingCount: 18900, isHot: true },
  { id: 'kh-012', title: 'Phong Vân', author: 'Mã Vinh Thành', cover: 'https://picsum.photos/seed/story12/300/400', genre: 'kiem-hiep', tags: ['Kiếm hiệp', 'Huynh đệ'], description: 'Phong và Vân, hai thiếu niên mồ côi được Hùng Bá nhận nuôi.', status: 'completed', totalChapters: 395, views: 4100000, rating: 4.7, ratingCount: 9300 },
  { id: 'dg-013', title: 'Dị Giới Thần Ma Lục', author: 'Đường Gia Tam Thiếu', cover: 'https://picsum.photos/seed/story13/300/400', genre: 'di-gioi', tags: ['Dị giới', 'Hệ thống'], description: 'Đường Tam, người sáng lập Đường Môn, đầu thai sang dị giới.', status: 'completed', totalChapters: 3306, views: 7100000, rating: 4.8, ratingCount: 13500, isFeatured: true, isHot: true },
  { id: 'dg-014', title: 'Linh Vũ Thiên Hạ', author: 'Mộng Nhập Thần Cơ', cover: 'https://picsum.photos/seed/story14/300/400', genre: 'di-gioi', tags: ['Dị giới', 'Linh vật'], description: 'Tâm Hồn Thạch Vân xuyên không sang thế giới Linh Vũ.', status: 'ongoing', totalChapters: 1234, views: 3400000, rating: 4.3, ratingCount: 5200 },
  { id: 'ts-015', title: 'Trọng Sinh Chi Tối Cường Kiếm Thần', author: 'Phong Ma Thiên Hạ', cover: 'https://picsum.photos/seed/story15/300/400', genre: 'trong-sinh', tags: ['Trọng sinh', 'Kiếm thuật'], description: 'Kiếm thần vô địch trọng sinh trở lại năm 16 tuổi.', status: 'ongoing', totalChapters: 987, views: 2800000, rating: 4.2, ratingCount: 4100 },
  { id: 'ts-016', title: 'Hồi Đáp Tuổi 18', author: 'Thanh Vân', cover: 'https://picsum.photos/seed/story16/300/400', genre: 'trong-sinh', tags: ['Trọng sinh', 'Học đường', 'Ngọt ngào'], description: 'Trợ lý giám đốc 35 tuổi trọng sinh về năm 18 tuổi.', status: 'completed', totalChapters: 234, views: 2100000, rating: 4.4, ratingCount: 3800 },
  { id: 'hh-017', title: 'Vạn Giới Tiên Tông', author: 'Lão Nhục', cover: 'https://picsum.photos/seed/story17/300/400', genre: 'huyen-huyen', tags: ['Huyền huyễn', 'Hệ thống'], description: 'Diệp Tiểu Thiên vô tình kế thừa di sản của một tiên nhân thất bại.', status: 'ongoing', totalChapters: 2145, views: 3900000, rating: 4.4, ratingCount: 5700 },
  { id: 'hh-018', title: 'Thần Mộ', author: 'Thần Đông', cover: 'https://picsum.photos/seed/story18/300/400', genre: 'huyen-huyen', tags: ['Huyền huyễn', 'Cổ mộ', 'Thần bí'], description: 'Diệp Thần, một cậu bé bình thường, vô tình được sinh ra với thể chất đặc biệt.', status: 'ongoing', totalChapters: 3456, views: 8900000, rating: 4.7, ratingCount: 14200, isHot: true },
  { id: 'khvt-019', title: 'Tam Thể', author: 'Lưu Từ Hân', cover: 'https://picsum.photos/seed/story19/300/400', genre: 'khoa-hoc-vien-tuong', tags: ['Khoa học', 'Ngoài hành tinh'], description: 'Câu chuyện về sự tồn tại của nhân loại trước một nền văn minh tiên tiến.', status: 'completed', totalChapters: 318, views: 6700000, rating: 4.9, ratingCount: 16800, isFeatured: true, isHot: true },
  { id: 'khvt-020', title: 'Vũ Trụ Song Sinh', author: 'Vũ Hành Không Gian', cover: 'https://picsum.photos/seed/story20/300/400', genre: 'khoa-hoc-vien-tuong', tags: ['Khoa học', 'Không gian'], description: 'Năm 2150, Trần Minh phát hiện tín hiệu lạ từ một ngôi sao.', status: 'ongoing', totalChapters: 187, views: 890000, rating: 4.3, ratingCount: 1200 },
  { id: 'tien-021', title: 'Phàm Nhân Tu Tiên', author: 'Vong Ngữ', cover: 'https://picsum.photos/seed/story21/300/400', genre: 'tien-hiep', tags: ['Tu tiên', 'Phàm nhân', 'Kiên trì'], description: 'Hàn Lập, không thiên tài, không cơ duyên, chỉ có sự kiên trì sắt đá.', status: 'completed', totalChapters: 2008, views: 11000000, rating: 4.9, ratingCount: 22000, isFeatured: true, isHot: true },
  { id: 'nt-022', title: 'Ác Ma Tổng Tài Truy Vợ', author: 'Yến Thanh', cover: 'https://picsum.photos/seed/story22/300/400', genre: 'ngon-tinh', tags: ['Tổng tài', 'Hài hước'], description: 'Hôn nhân hợp đồng với vị tổng tài lạnh lùng nhất thành phố.', status: 'ongoing', totalChapters: 524, views: 3100000, rating: 4.2, ratingCount: 4800 },
  { id: 'dt-023', title: 'Chí Tôn Võ Đế', author: 'Thiên Tâm', cover: 'https://picsum.photos/seed/story23/300/400', genre: 'do-thi', tags: ['Đô thị', 'Võ thuật', 'Gia tộc'], description: 'Từ chiến trường trở về, Lý Thiên Phong mang theo vết thương và bí mật.', status: 'ongoing', totalChapters: 1654, views: 4800000, rating: 4.3, ratingCount: 6900 },
  { id: 'ts-024', title: 'Xuyên Thành Nữ Phụ Phản Công', author: 'Cửu Nguyệt Hi', cover: 'https://picsum.photos/seed/story24/300/400', genre: 'trong-sinh', tags: ['Xuyên không', 'Nữ cường', 'Hài hước'], description: 'Xuyên vào một cuốn tiểu thuyết, lại xuyên vào vai nữ phụ phản diện.', status: 'completed', totalChapters: 389, views: 2700000, rating: 4.5, ratingCount: 5100 },
  { id: 'hh-025', title: 'Vô Hạn Khủng Bố', author: 'Huyễn Vũ', cover: 'https://picsum.photos/seed/story25/300/400', genre: 'huyen-huyen', tags: ['Kinh dị', 'Sinh tồn', 'Nhóm'], description: 'Không gian vô hạn — nơi người bình thường bị ném vào phim kinh dị để sinh tồn.', status: 'completed', totalChapters: 1312, views: 5200000, rating: 4.6, ratingCount: 8900, isHot: true },
  { id: 'kh-026', title: 'Xạ Điêu Anh Hùng Truyện', author: 'Kim Dung', cover: 'https://picsum.photos/seed/story26/300/400', genre: 'kiem-hiep', tags: ['Kiếm hiệp', 'Anh hùng'], description: 'Quách Tĩnh, con của một liệt sĩ, lớn lên trên thảo nguyên Mông Cổ.', status: 'completed', totalChapters: 305, views: 4600000, rating: 4.9, ratingCount: 13400, isFeatured: true },
  { id: 'dg-027', title: 'Thần Giới Truyền Thuyết', author: 'Hắc Sắc Đoạn Ảnh', cover: 'https://picsum.photos/seed/story27/300/400', genre: 'di-gioi', tags: ['Dị giới', 'Thần thánh', 'Chiến tranh'], description: 'Trần Hao xuyên không vào thế giới Thần Giới, nơi thần và người cùng chung sống.', status: 'ongoing', totalChapters: 2876, views: 4300000, rating: 4.4, ratingCount: 6300 },
  { id: 'tien-028', title: 'Nguyên Tôn', author: 'Thiên Tàm Thổ Đậu', cover: 'https://picsum.photos/seed/story28/300/400', genre: 'tien-hiep', tags: ['Tu tiên', 'Nguyên lực'], description: 'Chu Nguyên, thiếu niên bị phế bỏ Nguyên Mạch, vượt qua nghịch cảnh.', status: 'ongoing', totalChapters: 1567, views: 5100000, rating: 4.6, ratingCount: 7400, isHot: true },
  { id: 'nt-029', title: 'Hoàng Hậu Không Dễ Làm', author: 'Mặc Vũ Linh', cover: 'https://picsum.photos/seed/story29/300/400', genre: 'ngon-tinh', tags: ['Cổ đại', 'Hài hước', 'Cung đấu'], description: 'Bác sĩ hiện đại xuyên không trở thành hoàng hậu của vị hoàng đế không thích nàng.', status: 'completed', totalChapters: 298, views: 2400000, rating: 4.3, ratingCount: 3700 },
  { id: 'dt-030', title: 'Võ Thần', author: 'Nghịch Thiên', cover: 'https://picsum.photos/seed/story30/300/400', genre: 'do-thi', tags: ['Đô thị', 'Võ thuật', 'Dị năng'], description: 'Dương Thần, người thừa kế ẩn của gia tộc võ học ngàn năm.', status: 'ongoing', totalChapters: 1123, views: 3500000, rating: 4.1, ratingCount: 5600 },
];

const lorem = `Đây là nội dung chương truyện. Câu chuyện tiếp tục với những tình tiết hấp dẫn và kịch tính. Nhân vật chính đối mặt với những thử thách mới, buộc phải sử dụng hết khả năng và trí tuệ của mình để vượt qua.

Trong không gian rộng lớn của thế giới tu tiên, mỗi bước đi đều ẩn chứa nguy hiểm chực chờ. Những kẻ thù cũ xuất hiện, những người bạn mới được kết giao, và những bí ẩn dần dần được hé lộ.

Với quyết tâm sắt đá và ý chí không bao giờ chịu khuất phục, nhân vật chính tiếp tục con đường của mình, từng bước chinh phục những đỉnh cao mới của võ đạo. Cảnh vật thay đổi, nhưng trái tim vẫn kiên định với mục tiêu ban đầu.

Bầu trời rộng lớn phía trên, đất đai bao la phía dưới - trong khoảng không gian vô tận đó, một huyền thoại đang được viết nên từng ngày, từng giờ, bởi bàn tay và ý chí của người anh hùng chưa được ai biết đến.`;

async function main() {
  console.log('Seeding database...');
  for (const s of stories) {
    const data = {
      title: s.title, author: s.author, coverUrl: s.cover,
      genre: genreMap[s.genre], tags: s.tags, description: s.description,
      status: statusMap[s.status], totalChapters: s.totalChapters,
      views: s.views, rating: s.rating ?? 0, ratingCount: s.ratingCount ?? 0,
      isFeatured: s.isFeatured ?? false, isHot: s.isHot ?? false,
    };
    await prisma.story.upsert({ where: { id: s.id }, update: data, create: { id: s.id, ...data } });

    for (let i = 1; i <= 5; i++) {
      await prisma.chapter.upsert({
        where: { storyId_number: { storyId: s.id, number: i } },
        update: {},
        create: {
          storyId: s.id, number: i,
          title: `Chương ${i}: ${['Khởi Đầu', 'Phong Ba', 'Đột Phá', 'Bí Mật', 'Cao Trào'][i - 1]}`,
          content: lorem.repeat(3), wordCount: lorem.length * 3,
        },
      });
    }
    process.stdout.write(`\r  Seeded: ${s.title.padEnd(40)}`);
  }
  console.log('\n\nDone! Seeded', stories.length, 'stories with 5 chapters each.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
