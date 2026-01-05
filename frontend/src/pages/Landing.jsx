import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('Instagram');

  const services = [
    { name: 'Instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', color: 'text-pink-500', bg: 'bg-pink-50' },
    { name: 'Facebook', icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'TikTok', icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', color: 'text-slate-900', bg: 'bg-slate-50' },
  ];

  const benefits = [
    {
      title: 'Hỗ Trợ Nhiệt Tình',
      desc: 'Chúng tôi có đội ngũ hỗ trợ 24/24 , luôn giải đáp mọi thắc mắc của bạn trong quá trình sử dụng.',
      icon: 'https://cdn-icons-png.flaticon.com/512/8675/8675902.png'
    },
    {
      title: 'Giá Thành Hợp Lý',
      desc: 'HUYTICHXANH.COM luôn mang đến giá thành rẻ nhất Việt Nam . Phù hợp cho cả thành viên và đại lý đang tìm nguồn cung cấp.',
      icon: 'https://cdn-icons-png.flaticon.com/512/3594/3594449.png'
    },
    {
      title: 'Giao Diện Thân Thiện',
      desc: 'Tại HUYTICHXANH.COM , giao diện được làm tối giản và dễ sử dụng . Giúp bạn dễ dàng làm quen với website.',
      icon: 'https://cdn-icons-png.flaticon.com/512/9166/9166946.png'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-pink-100 italic-none">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-slate-800 flex items-center gap-1">
                HUYTICHXANH <span className="material-symbols-outlined text-[20px] text-blue-500">verified</span>
            </span>
          </div>
          
          <Link 
            to="/login"
            className="px-6 py-2 rounded-lg border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
          >
            Get Start
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight"
          >
            Hệ thống dịch vụ <br />
            <span className="bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">SMM PANEL</span> <br />
            an toàn và uy tín nhất
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-orange-400 font-medium"
          >
            ⭐ <span className="text-slate-600">Facebook - TikTok - Instagram</span> ⭐
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link 
              to="/login"
              className="px-10 py-3.5 rounded-xl border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-white transition-all shadow-lg hover:shadow-pink-200"
            >
              Đăng Nhập
            </Link>
            <Link 
              to="/register"
              className="px-10 py-3.5 rounded-xl border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-white transition-all shadow-lg hover:shadow-pink-200"
            >
              Đăng Ký
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-pink-50/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-16">Những Lợi Ích Bạn Được Nhận</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-24 h-24 flex items-center justify-center">
                    <img src={benefit.icon} alt={benefit.title} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
          </div>
        </div>
      </section>

      {/* Services Tabs Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">HUYTICHXANH.COM</h2>
          <div className="flex justify-center mb-12">
            <span className="material-symbols-outlined text-4xl text-cyan-400 rotate-180 animate-bounce">expand_more</span>
          </div>

          <div className="bg-blue-50/50 rounded-[40px] p-4 md:p-8 flex flex-col gap-8 shadow-sm border border-white">
            <div className="flex flex-wrap justify-center gap-3">
              {services.map((service) => (
                <button
                  key={service.name}
                  onClick={() => setActiveTab(service.name)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === service.name 
                    ? `bg-white shadow-lg shadow-blue-100 border-2 border-blue-500 ${service.color}` 
                    : 'bg-white/50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <img src={service.icon} alt={service.name} className="w-5 h-5 object-contain" />
                  {service.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 h-[300px]">
              <div className="text-left space-y-4">
                <h3 className="text-3xl font-bold text-slate-800">Dịch Vụ {activeTab}</h3>
              </div>
              <div className="w-64 h-40 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
                 <div className="flex items-center gap-3">
                    <img src={services.find(s => s.name === activeTab)?.icon} alt={activeTab} className="w-12 h-12 object-contain" />
                    <span className="text-3xl font-bold text-slate-800">{activeTab}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-left space-y-4 md:w-1/2">
            <span className="text-slate-400 font-medium">HUYTICHXANH.COM</span>
            <h2 className="text-4xl font-bold text-slate-800">Thanh Toán Đa Nền Tảng</h2>
            <p className="text-slate-500">Bạn có thể nạp tiền mọi ngân hàng tại Việt Nam.</p>
          </div>
          
          <div className="md:w-1/2 flex flex-wrap justify-center gap-6">
            {['BIDV', 'Vietcombank', 'Techcombank', 'MB', 'OCB', 'VPBank', 'VietinBank'].map((bank) => (
              <div key={bank} className="bg-white px-6 py-3 rounded-xl shadow-md border border-slate-50 flex items-center justify-center font-bold text-slate-700 min-w-[140px]">
                {bank}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-linear-to-r from-cyan-400 to-blue-600 rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                {/* Floating Icons Decors */}
                <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-2xl">🐦</span>
                </div>
                <div className="absolute top-1/2 -left-8 w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center animate-bounce shadow-xl">
                    <span className="text-3xl">📸</span>
                </div>
                <div className="absolute bottom-10 left-20 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
                    <span className="text-xl">🎵</span>
                </div>
                <div className="absolute top-20 right-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
                    <span className="text-2xl">👤</span>
                </div>
                <div className="absolute bottom-20 right-2 w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center animate-bounce">
                    <span className="text-3xl">📺</span>
                </div>
                
                {/* Content */}
                <div className="relative z-10 space-y-8">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                        Bạn Đã Sẵn Sàng Sử Dụng <br /> HUYTICHXANH.COM chưa ?
                    </h2>
                    <p className="text-white/80 text-sm font-medium">Nếu cần tư vấn thêm hãy liên hệ với chúng tôi !</p>
                    
                    <div className="pt-8">
                        <Link 
                            to="/login"
                            className="bg-white text-blue-900 px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-110 transition-transform inline-block"
                        >
                            Sử Dụng Ngay
                        </Link>
                    </div>
                </div>

                <div className="absolute -top-10 -right-10 w-40 h-40 border-15 border-emerald-300 rounded-full opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl"></div>
            </div>
          </div>
      </section>

      {/* Floating Chat/Help icon placeholder if needed */}
      <div className="fixed bottom-10 right-10 z-50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer hover:rotate-12 transition-transform border border-slate-100">
             <span className="material-symbols-outlined text-purple-600 text-4xl">chat</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
