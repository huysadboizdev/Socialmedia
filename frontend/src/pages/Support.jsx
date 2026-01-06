import React from 'react';

const Support = () => {
  const supportChannels = [
    {
      title: "Admin Hỗ Trợ Nhanh Nhất ZaLo",
      label: "Tại Đây",
      url: "https://zalo.me/0763076124", // User can update this
      icon: "https://cdn-icons-png.flaticon.com/512/3536/3536445.png", // Generic smartphone/zalo icon placeholder
      iconType: "image"
    },
    {
      title: "FaceBook CSKH ( Ưu Tiên Zalo )",
      label: "Tại Đây",
      url: "https://www.facebook.com/huy.haquang.39395/", // User can update this
      icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
      iconType: "image"
    },
    {
      title: "Telegram Hỗ Trợ",
      label: "Tại Đây",
      url: "https://t.me/badboiz123", // User can update this
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png",
      iconType: "image"
    }
  ];

  const notes = [
    "Vui lòng liên hệ các kênh hỗ trợ bên trên nếu bạn cần hỗ trợ về đơn hàng hoặc tư vấn dịch vụ.",
    "Thời gian hỗ trợ : 7h30 - 22h30.",
    "Gặp lỗi gì vui lòng vào thẳng vấn đề để được hỗ trợ tốt nhất nhé !"
  ];

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-[#8A2BE2] text-white p-5 rounded-t-xl shadow-lg">
          <h1 className="text-xl font-bold">Hỗ trợ trực tiếp</h1>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-b-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-10 space-y-8 transition-colors">
          
          {/* Support Channels */}
          <div className="space-y-6">
            {supportChannels.map((channel, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="size-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors">
                   <img src={channel.icon} alt={channel.title} className="size-6 object-contain" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-sm md:text-base">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{channel.title} : </span>
                  <a 
                    href={channel.url} 
                    className="text-[#8A2BE2] hover:underline font-bold transition-all"
                  >
                    {channel.label}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="pt-8 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-5">
            {notes.map((note, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="size-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0">
                  <span className="material-symbols-outlined text-[#E91E63] text-2xl">mail</span>
                </div>
                <p className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 pt-2">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
