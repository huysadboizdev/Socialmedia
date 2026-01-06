import React from 'react';

const Terms = () => {
  const sections = [
    {
      title: "QUY ĐỊNH VỀ TIỀN TRÊN WEBSITE",
      content: [
        "Giá trị quy đổi tương đương tiền tệ VNĐ, tỉ giá giao động theo thị trường.",
        "Hình thức nạp tiền vào website là hoàn toàn tự nguyện, dùng để sử dụng các dịch vụ được cung cấp trên website.",
        "Khi nạp tiền vào website người dùng sẽ nhận được số tiền tương ứng (có thể thêm khuyến mãi từ admin) và số tiền này không thể quy đổi ngược lại."
      ]
    },
    {
      title: "QUY ĐỊNH ĐƠN HÀNG",
      content: [
        "Nên chạy test số lượng nhỏ để chọn dịch vụ phù hợp.",
        "Bắt buộc đọc kĩ thông tin máy chủ (chọn server sẽ hiện).",
        "Yêu cầu cài dịch vụ đúng thông tin máy chủ yêu cầu.",
        "Phần tốc độ chỉ để tham khảo, KHÔNG chính xác 100%.",
        "Mỗi dịch vụ có các quy định khác nhau, xem chi tiết tại thông tin máy chủ của dịch vụ trước khi sử dụng.",
        "Các dịch vụ có quy định và cách thức hoạt động có thể thay đổi theo thời gian.",
        "Các đơn hàng báo lỗi, báo huỷ liên hệ admin để được kiểm tra và xử lý."
      ]
    },
    {
      title: "QUY ĐỊNH CHẤT LƯỢNG DỊCH VỤ",
      content: [
        "Website chúng tôi nghiên về hướng cung cấp dịch vụ GIÁ RẺ, có các loại như sau:",
        "Không Bảo Hành: Dịch vụ có rủi ro, đơn có thể không chạy hoặc không đạt yêu cầu (không hỗ trợ hoàn tiền).",
        "Có Bảo Hành: Dịch vụ có bảo hành trong thời gian ghi trên thông tin máy chủ (lên thiếu hoặc không lên có thể yêu cầu bảo hành).",
        "Bạn có thể yêu cầu thêm bảo hành cho dịch vụ không có bảo hành.",
        "Đơn hàng không bảo hành nhưng gửi admin có thể xem xét hỗ trợ hoàn tiền.",
        "Mọi quyết định cuối cùng đều do admin quyết định."
      ]
    },
    {
      title: "ĐỐI VỚI BÊN KHÁCH HÀNG",
      content: [
        "Không sử dụng các nội dung vi phạm pháp luật, chính trị, đồi truỵ,... Vi phạm sẽ bị khóa tài khoản và chịu trách nhiệm trước pháp luật.",
        "Có thể báo cáo các dịch vụ không đạt hiệu quả tại mục hỗ trợ."
      ]
    },
    {
      title: "ĐỐI VỚI BÊN ADMIN",
      content: [
        "Chúng tôi có trách nhiệm hoàn thành các dịch vụ đã yêu cầu.",
        "Tiếp nhận và xử lý các lỗi do người dùng báo cáo.",
        "Từ chối hỗ trợ các ID vi phạm hoặc không thực hiện theo hướng dẫn."
      ]
    },
    {
      title: "QUY ĐỊNH VỀ YÊU CẦU HỖ TRỢ ĐƠN",
      content: [
        "Khi yêu cầu hỗ trợ, vui lòng nhắn thẳng vào vấn đề cần hỗ trợ.",
        "Gửi mã đơn hàng (gửi riêng, không ghi chung dòng).",
        "Miêu tả rõ ràng vấn đề bạn gặp phải để admin có thể hỗ trợ tốt nhất."
      ]
    },
    {
      title: "QUY ĐỊNH, CHÍNH SÁCH BẢO MẬT",
      content: [
        "Chúng tôi thu thập các thông tin người dùng như: số điện thoại, email, IP, các ID và nội dung dịch vụ,...",
        "Mọi thông tin người dùng sẽ được bảo mật."
      ]
    }
  ];

  const serviceStatuses = [
    { label: "Hoàn thành", desc: "Hoàn thành đơn hàng.", color: "text-green-600 bg-green-50" },
    { label: "Đang chạy", desc: "Đơn hàng trong tiến trình chạy.", color: "text-blue-600 bg-blue-50" },
    { label: "Đang tiến hành", desc: "Đơn hàng đang tiến hành xếp đơn.", color: "text-red-600 bg-red-50" },
    { label: "Đang xử lý", desc: "Đơn hàng đang lên đơn.", color: "text-orange-600 bg-orange-50" },
    { label: "Đã hủy", desc: "Có lỗi trong tiến trình, liên hệ admin kiểm tra.", color: "text-gray-600 bg-gray-50" },
    { label: "Chờ xử lý", desc: "Đơn hàng đang chờ lên đơn.", color: "text-yellow-600 bg-yellow-50" },
    { label: "Đã hoàn tiền", desc: "Đơn hàng đã được xác nhận lỗi và hoàn tiền.", color: "text-red-600 bg-red-50" },
  ];

  const paymentStatuses = [
    { label: "Chờ xử lý", desc: "Thẻ cào đã được gửi đi và đang chờ xét thẻ.", color: "text-yellow-600 bg-yellow-50" },
    { label: "Thành công", desc: "Thẻ gửi đúng và được cộng tiền.", color: "text-green-600 bg-green-50" },
    { label: "Thất bại", desc: "Thẻ gửi sai hoặc đã được sử dụng trước đó.", color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center py-6 space-y-2">
          <h1 className="text-xl md:text-2xl font-bold">
            <span className="text-red-600 uppercase">KHI BẠN SỬ DỤNG WEBSITE</span>{" "}
            <span className="text-red-600">huytichxanh</span>
          </h1>
          <p className="text-slate-800 dark:text-slate-200 font-bold">
            Có nghĩa là bạn đồng ý với các điều khoản dưới đây!
          </p>
        </div>

        {/* Regulation Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                {section.title}
              </h2>
            </div>
            <ul className="p-6 space-y-3">
              {section.content.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed items-start">
                  <span className="text-slate-400 mt-1.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Status Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Statuses */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
             <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                CÁC TRẠNG THÁI DỊCH VỤ
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {serviceStatuses.map((status, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.color} border border-current opacity-80 min-w-[100px] text-center`}>
                    {status.label}
                  </span>
                  <span className="text-slate-400">:</span>
                  <span className="text-slate-600 dark:text-slate-400">{status.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Statuses */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
             <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                CÁC TRẠNG THÁI NẠP THẺ CÀO
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {paymentStatuses.map((status, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.color} border border-current opacity-80 min-w-[100px] text-center`}>
                    {status.label}
                  </span>
                  <span className="text-slate-400">:</span>
                  <span className="text-slate-600 dark:text-slate-400">{status.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <p className="text-red-600 font-bold italic text-sm">
            Lưu ý: Điều khoản này sẽ được thay đổi và cập nhật thường xuyên.
          </p>
          <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              huytichxanh Chân Thành Cảm Ơn Đã Sử Dụng Dịch Vụ.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Terms;
