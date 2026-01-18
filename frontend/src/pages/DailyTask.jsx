import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import axios from 'axios';
import huongDanTaiImg from '../assets/huongdantaiv2.png';
import huongDanDungImg from '../assets/huongdandung.png';

// --- SUB COMPONENTS ---

const MissionTimer = ({ clickedAt, onExpire }) => {
    // Lazy initialization for state
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!clickedAt) return 0;
        const deadline = new Date(clickedAt).getTime() + 3 * 60 * 1000;
        return Math.max(0, deadline - Date.now());
    });

    useEffect(() => {
        if (!clickedAt) return;
        
        const deadline = new Date(clickedAt).getTime() + 3 * 60 * 1000;
        
        // Timer logic handles updates

        const timer = setInterval(() => {
            const remaining = Math.max(0, deadline - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                if (onExpire) onExpire();
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, [clickedAt, onExpire]); // Added onExpire dependency

    if (!clickedAt) return null;

    if (!clickedAt) return null;

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const isUrgent = minutes === 0 && seconds < 30;

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border transition-colors duration-300 ${
            isUrgent 
            ? 'bg-red-600 text-white animate-bounce' 
            : 'bg-orange-100 text-orange-600 border-orange-200'
        }`}>
            <span className="material-symbols-outlined text-[16px]">timer</span>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );
};

// --- MAIN COMPONENT ---

const DailyTask = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [withdrawalType, setWithdrawalType] = useState('web');
  const [amount, setAmount] = useState('');
  
  const [missions, setMissions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [emailForNotification, setEmailForNotification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastWithdrawAmount, setLastWithdrawAmount] = useState(0);
  
  // UI States
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  
  const navigate = useNavigate();
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [instructionTab, setInstructionTab] = useState('mobile'); // 'mobile' | 'desktop'
  const [instructionMission, setInstructionMission] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [focusedMissionId, setFocusedMissionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  // Stats grid data
  const stats = [
    {
      label: 'Số Dư',
      value: userData ? `${(userData.missionBalance || 0).toLocaleString()} đ` : '0 đ',
      icon: 'database',
      color: 'bg-orange-50',
      iconColor: 'text-orange-500',
      circleColor: 'bg-orange-100'
    },
    {
      label: 'Đã Rút',
      value: '0 đ', 
      icon: 'account_balance_wallet',
      color: 'bg-purple-50',
      iconColor: 'text-purple-500',
      circleColor: 'bg-purple-100'
    }
  ];

  useEffect(() => {
    fetchMissions();
    fetchUserData();
    const savedActiveId = localStorage.getItem('activeMissionId');
    if (savedActiveId) {
        setFocusedMissionId(savedActiveId);
    }
  }, []);

  const fetchUserData = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
            setUserData(res.data.user);
        }
    } catch (error) {
        console.error('Fetch user data error:', error);
    }
  };

  const fetchMissions = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/missions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
            setMissions(res.data.missions);
        }
    } catch (error) {
        console.error('Fetch missions error:', error);
        toast.error('Không thể tải danh sách nhiệm vụ');
    } finally {
        setLoading(false);
    }
  };

  const handleLinkClick = async (mission) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/mission/click`, 
        { missionId: mission._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
          window.open(mission.link, '_blank');
          setFocusedMissionId(mission._id);
          localStorage.setItem('activeMissionId', mission._id);
          fetchMissions(); // Refresh to get the clickedAt timestamp
      } else {
          toast.error(res.data.message || 'Lỗi khi ghi nhận click. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error("Error recording click:", error);
      toast.error('Có lỗi xảy ra khi thực hiện nhiệm vụ.');
    }
  };

  /* Utility: Compress Image using Canvas */
  const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; // Limit max width to 1000px
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Compress to JPEG with 0.7 quality
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    }));
                }, 'image/jpeg', 0.7); 
            };
        };
    });
  };

  const handleSubmitProof = async (missionId, file) => {
      if (!file) return;

      try {
          setSubmitting(true);
          toast.info("Đang xử lý ảnh...");
          
          // Compress image before upload
          const compressedFile = await compressImage(file);
          console.log(`Original: ${file.size / 1024}KB, Compressed: ${compressedFile.size / 1024}KB`);

          const formData = new FormData();
          formData.append('missionId', missionId);
          formData.append('imageProof', compressedFile);

          const token = localStorage.getItem('token');
          const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/mission/submit`, formData, {
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          });

          if (res.data.success) {
              toast.success(res.data.message);
              clearFocus();
              fetchMissions(); // Refresh list to show new status
          } else {
              toast.error(res.data.message);
          }
      } catch (error) {
          console.error("Submit error", error);
          toast.error("Lỗi khi nộp nhiệm vụ");
      } finally {
          setSubmitting(false);
      }
  }

  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const handleWithdrawal = async () => {
    const numAmount = parseInt(amount);
    if (!amount || numAmount < 10000) {
      toast.error('Số tiền rút tối thiểu là 10.000 đ');
      return;
    }
    
    if (userData && (userData.missionBalance || 0) < numAmount) {
        toast.error('Số dư nhiệm vụ không đủ');
        return;
    }

    if (withdrawalType === 'bank') {
        if (!bankName || !bankAccount) {
            toast.error('Vui lòng nhập đầy đủ thông tin ngân hàng');
            return;
        }
    }

    try {
        setSubmitting(true);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('amount', numAmount);
        formData.append('method', withdrawalType);
        
        if (withdrawalType === 'bank') {
            formData.append('bankName', bankName);
            formData.append('bankAccount', bankAccount);
            if (qrCodeFile) {
                formData.append('qrCode', qrCodeFile);
            }
            if (emailForNotification) {
                formData.append('email', emailForNotification);
            }
        }

        const dataResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/mission/withdraw`, formData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
             }
        });

        if (dataResponse.data.success) {
            // Save amount for modal display
            setLastWithdrawAmount(numAmount);
            
            // Show custom modal instead of toast for instructions
            setShowWithdrawSuccessModal(true);
            
            // Reset form
            setAmount('');
            setBankName('');
            setBankAccount('');
            setQrCodeFile(null);
            setWithdrawalType('web');
            
            // Update local balance
            if (dataResponse.data.missionBalance !== undefined) {
                setUserData(prev => ({ 
                    ...prev, 
                    missionBalance: dataResponse.data.missionBalance,
                    balance: dataResponse.data.balance || prev.balance
                }));
            }
        } else {
            toast.error(dataResponse.data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
        setSubmitting(false);
    }
  };
 
  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Filter Logic
  const allFilteredMissions = activeTab === 'list' 
    ? missions.filter(m => m.status === 'available')
    : missions.filter(m => m.status !== 'available');

  const activeMission = missions.find(m => m._id === focusedMissionId);

  // Focus View Logic
  const filteredMissions = focusedMissionId 
    ? (activeMission ? [activeMission] : allFilteredMissions)
    : allFilteredMissions;

  // Pagination Logic
  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage);
  const paginatedMissions = focusedMissionId 
    ? filteredMissions 
    : filteredMissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFocus = () => {
    setFocusedMissionId(null);
    localStorage.removeItem('activeMissionId');
  };

  const handleAcceptMission = async (missionId) => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/mission/accept`, { missionId }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
              toast.success(res.data.message);
              fetchMissions(); // Refresh lists
              setActiveTab('received'); // Auto switch to received tab
          } else {
              toast.error(res.data.message);
          }
      } catch {
          toast.error("Lỗi khi nhận nhiệm vụ");
      }
  }

  const fee = withdrawalType === 'bank' ? (parseInt(amount) || 0) * 0.2 : 0;
  const finalAmount = (parseInt(amount) || 0) - fee;

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-all hover:shadow-md">
            <div className={`size-16 rounded-full ${stat.circleColor} dark:bg-slate-800 flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[32px] ${stat.iconColor}`}>
                {stat.icon}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>


      {/* Task Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => {
                setActiveTab('list');
                setCurrentPage(1);
                clearFocus();
            }}
            className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${
              activeTab === 'list'
                ? 'bg-[#6610f2] border-[#6610f2] text-white shadow-lg shadow-purple-500/30'
                : 'bg-white border-[#6610f2] text-[#6610f2] hover:bg-purple-50'
            }`}
          >
            Danh sách nhiệm vụ
          </button>
          <button
            onClick={() => {
                setActiveTab('received');
                setCurrentPage(1);
                clearFocus();
            }}
            className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${
              activeTab === 'received'
                ? 'bg-[#6610f2] border-[#6610f2] text-white shadow-lg shadow-purple-500/30'
                : 'bg-white border-[#6610f2] text-[#6610f2] hover:bg-purple-50'
            }`}
          >
            Nhiệm vụ đã nhận ({missions.filter(m => m.status !== 'available').length})
          </button>
          
          <button
            onClick={() => {
                setInstructionMission(null);
                setShowInstructionModal(true);
            }}
            className="ml-auto px-4 py-3 rounded-full font-bold transition-all bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px] text-purple-600">menu_book</span>
            Hướng dẫn làm nhiệm vụ
          </button>
        </div>

        {/* Mission List */}
        <div className="space-y-4">
             {focusedMissionId && (
                 <div className="flex justify-between items-center mb-4">
                     <button 
                         onClick={clearFocus}
                         className="flex items-center gap-2 text-purple-600 font-bold hover:underline"
                     >
                         <span className="material-symbols-outlined">arrow_back</span>
                         Quay lại danh sách
                     </button>
                     <div className="flex items-center gap-2">
                         {/* TIMER COMPONENT */}
                         <MissionTimer 
                            key={activeMission?._id}
                            clickedAt={activeMission?.clickedAt} 
                            onExpire={() => {
                                setShowTimeoutModal(true);
                            }} 
                         />
                         
                         <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black animate-pulse uppercase tracking-widest border border-red-200">
                             <span className="size-2 bg-red-600 rounded-full"></span>
                             Đang thực hiện
                         </div>
                     </div>
                 </div>
             )}

            {loading ? (
                <div className="text-center py-10 text-slate-500">Đang tải nhiệm vụ...</div>
            ) : paginatedMissions.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">assignment_late</span>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Hiện không có nhiệm vụ nào</p>
                </div>
            ) : (
                <>
                    {paginatedMissions.map((mission) => {
                        const isExpired = mission.clickedAt && mission.status !== 'approved' && mission.status !== 'pending' && 
                             (Date.now() - new Date(mission.clickedAt).getTime() > 3 * 60 * 1000);

                        return (
                        <div 
                            key={mission._id} 
                            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-center gap-6 transition-all ${
                                focusedMissionId === mission._id 
                                ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] ring-2 ring-red-500/20' 
                                : 'border-slate-100 dark:border-slate-800'
                            }`}
                        >
                            <div className={`shrink-0 size-16 rounded-2xl flex items-center justify-center ${
                                 mission.type === 'like' ? 'bg-blue-50 text-blue-600' :
                                 mission.type === 'follow' ? 'bg-pink-50 text-pink-600' :
                                 'bg-violet-50 text-violet-600'
                            }`}>
                                <span className="material-symbols-outlined text-3xl">
                                    {mission.type === 'like' ? 'thumb_up' : mission.type === 'follow' ? 'person_add' : 'share'}
                                </span>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{mission.title}</h3>
                                <p className="text-sm font-medium text-slate-500 flex justify-center md:justify-start items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                                    Thưởng: <span className="text-emerald-600 font-bold">+{mission.reward?.toLocaleString()} đ</span>
                                </p>
                                
                                {/* Hide Link for Available missions */}
                                {mission.status !== 'available' && !isExpired && (
                                    <a 
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLinkClick(mission);
                                        }}
                                        className="text-xs text-blue-500 hover:underline truncate max-w-[200px] inline-block"
                                    >
                                        Link nhiệm vụ
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 min-w-[140px]">
                                {/* 1. EXPIRED -> Show "Thất bại" */}
                                {isExpired && (
                                     <div className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg text-sm flex items-center justify-center gap-2 border border-red-200">
                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                        Thất bại
                                    </div>
                                )}


                                {/* 2. AVAILABLE -> Show "Nhận nhiệm vụ" - MODIFIED: Open Instruction Modal */}
                                {!isExpired && mission.status === 'available' && (
                                    <button 
                                        onClick={() => {
                                            setInstructionMission(mission);
                                            setShowInstructionModal(true);
                                        }}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_task</span>
                                        Nhận nhiệm vụ
                                    </button>
                                )}

                                {/* 3. ACCEPTED or REJECTED -> Show Submit Actions (If NOT Expired) */}
                                {!isExpired && (mission.status === 'accepted' || mission.status === 'rejected') && (
                                    <>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleLinkClick(mission)}
                                                className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                Thực hiện
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setInstructionMission(mission);
                                                    setShowInstructionModal(true);
                                                }}
                                                className="size-[38px] flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                                                title="Xem hướng dẫn"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                                            </button>
                                        </div>
                                        
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id={`file-${mission._id}`} 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if(e.target.files?.[0]) {
                                                        handleSubmitProof(mission._id, e.target.files[0]);
                                                    }
                                                }}
                                                disabled={submitting}
                                            />
                                            <label 
                                                htmlFor={`file-${mission._id}`}
                                                className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${submitting ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                                {submitting ? 'Đang gửi...' : 'Gửi ảnh'}
                                            </label>
                                        </div>
                                    </>
                                )}

                                {!isExpired && mission.status === 'pending' && (
                                    <div className="flex flex-col gap-2">
                                        <div className="px-4 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-lg text-sm flex items-center justify-center gap-2 border border-yellow-200">
                                            <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                                            Chờ duyệt 24h
                                        </div>
                                         <button
                                            onClick={() => {
                                                setInstructionMission(mission);
                                                setShowInstructionModal(true);
                                            }}
                                            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">menu_book</span>
                                            Xem lại hướng dẫn
                                        </button>
                                    </div>
                                )}

                                {mission.status === 'approved' && (
                                    <div className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg text-sm flex items-center justify-center gap-2 border border-green-200">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Đã hoàn thành
                                    </div>
                                )}

                                {!isExpired && mission.status === 'rejected' && (
                                    <div className="text-xs text-center text-red-500 font-bold mb-1">
                                        Bị từ chối. Hãy nộp lại!
                                    </div>
                                )}
                                
                            </div>
                        </div>
                    );
                })}

                    {/* Pagination Controls */}
                    {!focusedMissionId && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`size-10 flex items-center justify-center rounded-lg font-bold transition-all shadow-sm ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white shadow-blue-500/30'
                                             : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
        <div className="bg-[#6610f2] p-4 text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">credit_card</span>
          <h3 className="font-bold uppercase tracking-wide">YÊU CẦU RÚT TIỀN</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Alerts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#856404] bg-[#fff3cd] border-l-4 border-[#ffeeba] p-3 rounded font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Số tiền có thể rút : từ <span className="font-bold">10,000 đ</span> đến <span className="font-bold">8,888,888 đ</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#856404] font-medium text-sm px-3">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Số dư có thể rút của bạn là : <span className="font-bold">{userData ? `${(userData.missionBalance || 0).toLocaleString()} đ` : '0 đ'}</span></span>
            </div>
            <div className="flex items-start gap-2 text-red-600 font-bold text-sm px-3">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <div>
                Lưu Ý:<br />
                Rút Về Ngân Hàng Sẽ Mất Phí 20%
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm px-3">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Rút Về Tài Khoản Web Sẽ Không Mất Phí Rút Tiền</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                Hình Thức Rút Tiền
              </label>
              <div className="relative">
                <select
                  value={withdrawalType}
                  onChange={(e) => setWithdrawalType(e.target.value)}
                  className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium appearance-none"
                >
                  <option value="web">Rút về Tài Khoản Web</option>
                  <option value="bank">Rút về Ngân Hàng</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400">expand_more</span>
                </div>
              </div>
            </div>

            {withdrawalType === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            Tên Ngân Hàng
                        </label>
                        <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                            placeholder="Ví dụ: MB Bank, Vietcombank..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            Số Tài Khoản
                        </label>
                        <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                            placeholder="Nhập số tài khoản..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            Email Nhận Thông Báo
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={emailForNotification}
                                onChange={(e) => setEmailForNotification(e.target.value)}
                                className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium pl-11"
                                placeholder="Nhập email để nhận thông báo khi tiền về..."
                            />
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                mail
                            </span>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            Tải Ảnh QR Nhận Tiền
                        </label>
                        <div className="relative">
                            <input 
                                type="file" 
                                id="qr-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => setQrCodeFile(e.target.files?.[0])}
                            />
                            <label 
                                htmlFor="qr-upload"
                                className="w-full p-3.5 border border-dashed border-[#6610f2]/30 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all group"
                            >
                                <span className="material-symbols-outlined text-purple-600 group-hover:scale-110 transition-transform">qr_code_2</span>
                                <span className="text-sm font-medium text-slate-600">
                                    {qrCodeFile ? qrCodeFile.name : 'Chọn ảnh QR để admin dễ nhận diện'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                Số Tiền Rút
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                placeholder="Nhập số tiền muốn rút..."
              />
              {amount && withdrawalType === 'bank' && (
                  <div className="mt-2 text-xs font-bold text-slate-500 flex justify-between px-1">
                      <span>Thực nhận: <span className="text-emerald-600">{finalAmount.toLocaleString()} đ</span></span>
                      <span>Phí 20%: <span className="text-red-500">{fee.toLocaleString()} đ</span></span>
                  </div>
              )}
            </div>

            <button
              onClick={handleWithdrawal}
              disabled={submitting}
              className="w-full py-4 bg-[#6610f2] hover:bg-[#520dc2] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 uppercase tracking-wide group disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                send
              </span>
              {submitting ? 'ĐANG XỬ LÝ...' : 'RÚT TIỀN NGAY'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Expiration Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border-2 border-red-500 animate-in zoom-in-95 duration-200">
            <div className="mx-auto size-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl">timer_off</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Hết thời gian!
            </h3>
            <p className="text-slate-500 mb-6 font-medium">
              Bạn đã quá 3 phút để hoàn thành nhiệm vụ này.
              <br/>
              Nhiệm vụ đã bị hủy bỏ.
            </p>
            <button
              onClick={() => {
                setShowTimeoutModal(false);
                clearFocus();
              }}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
            >
              Đã hiểu, quay lại
            </button>
          </div>
        </div>
      )}

      {/* Instruction Modal */}
      {showInstructionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowInstructionModal(false)}
              />
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="flex items-center gap-3 mb-4 text-purple-600">
                      <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">menu_book</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          Hướng dẫn nhiệm vụ
                      </h3>
                  </div>

                  {/* Tabs for Desktop/Mobile */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                      <button
                          onClick={() => setInstructionTab('mobile')}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                              instructionTab === 'mobile'
                                  ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                          <span className="material-symbols-outlined text-[18px]">smartphone</span>
                          Mobile
                      </button>
                      <button
                          onClick={() => setInstructionTab('desktop')}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                              instructionTab === 'desktop'
                                  ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                          <span className="material-symbols-outlined text-[18px]">computer</span>
                          Desktop
                      </button>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 pr-2 space-y-4 mb-6 custom-scrollbar">
                      
                      {/* Step 1 (DESKTOP ONLY): Install Extension */}
                      {instructionTab === 'desktop' && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/50">
                             <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                <span className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                                Cài đặt Extension Hỗ Trợ
                            </h4>
                            <div className="pl-8 space-y-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Bắt buộc phải cài đặt Extension để hệ thống tự động kiểm tra nhiệm vụ.
                                </p>
                                <a 
                                    href="https://chromewebstore.google.com/detail/%C4%91%E1%BB%93ng-h%E1%BB%93-cho-google-chrome/emakkfldeggiinnfcdjkakdfcppbfhdg?hl=vi&utm_source=ext_sidebar" 
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition-colors shadow-lg shadow-purple-500/30"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Tải Extension tại đây
                                </a>
                                

                                {/* Image Placeholders */}
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                     {/* Bỏ link ảnh hướng dẫn tải vào src bên dưới */}
                                     <img 
                                        src={huongDanTaiImg} 
                                        alt="Hướng dẫn tải"
                                        className="w-full aspect-video object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setZoomedImage(huongDanTaiImg)}
                                     />
                                     
                                     {/* Bỏ link ảnh hướng dẫn cài vào src bên dưới */}
                                     <img 
                                        src={huongDanDungImg} 
                                        alt="Hướng dẫn cài"
                                        className="w-full aspect-video object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setZoomedImage(huongDanDungImg)}
                                     />
                                </div>
                            </div>
                        </div>
                      )}

                      {/* Step 2 (Desktop) / Step 1 (Mobile): Link */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                              <span className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                                  {instructionTab === 'desktop' ? '2' : '1'}
                              </span>
                              Truy cập liên kết
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                              Nhấn vào nút <span className="font-bold text-purple-600">"Link nhiệm vụ"</span> hoặc <span className="font-bold text-purple-600">"Thực hiện"</span> để mở trang web cần tương tác.
                              {instructionTab === 'desktop' ? ' (Nên mở tab mới trên trình duyệt).' : ' (Sẽ mở ứng dụng Facebook/TikTok/..).'}
                          </p>
                      </div>

                      {/* Step 3 (Desktop) / Step 2 (Mobile): Interact */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                           <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                              <span className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                                  {instructionTab === 'desktop' ? '3' : '2'}
                              </span>
                              Thực hiện tương tác
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                              Thực hiện đúng yêu cầu: <span className="font-bold text-blue-600">Like</span>, <span className="font-bold text-pink-600">Follow</span>, hoặc <span className="font-bold text-violet-600">Share</span> bài viết/trang cá nhân đó.
                          </p>
                      </div>

                      {/* Step 4 (Desktop) / Step 3 (Mobile): Screenshot - DYNAMIC CONTENT */}
                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                           <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                              <span className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                                  {instructionTab === 'desktop' ? '4' : '3'}
                              </span>
                              Chụp ảnh bằng chứng
                          </h4>
                          <div className="pl-8 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                              <p>
                                  {instructionTab === 'desktop' 
                                      ? 'Chụp TOÀN BỘ MÀN HÌNH máy tính.' 
                                      : 'Chụp màn hình điện thoại.'}
                              </p>
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                                  {instructionTab === 'desktop' ? (
                                      <>
                                          <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Yêu cầu Desktop:</p>
                                          <ul className="list-disc list-inside text-xs space-y-1">
                                              <li>Phải thấy rõ <span className="text-red-500 font-bold">thanh Taskbar</span> (thanh công cụ bên dưới).</li>
                                              <li>Phải thấy rõ <span className="text-red-500 font-bold">ngày giờ hệ thống</span> ở góc phải.</li>
                                              <li>Trình duyệt phải thấy rõ hành động (Đã Like/Follow).</li>
                                          </ul>
                                      </>
                                  ) : (
                                      <>
                                          <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Yêu cầu Mobile:</p>
                                          <ul className="list-disc list-inside text-xs space-y-1">
                                              <li>Phải thấy rõ <span className="text-red-500 font-bold">thanh trạng thái</span> trên cùng (giờ, pin, sóng).</li>
                                              <li>KHÔNG tải ảnh đã cắt (crop).</li>
                                              <li>Ảnh phải chụp toàn bộ giao diện ứng dụng.</li>
                                          </ul>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                      
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50">
                           <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-xl">warning</span>
                              Lưu ý quan trọng
                          </h4>
                          <ul className="list-disc list-inside text-sm text-red-600 space-y-1 ml-1">
                              <li>Không dùng ảnh cũ hoặc ảnh mạng.</li>
                              <li>Thời gian nộp bài phải trùng khớp với thời gian chụp.</li>
                              <li>Nếu phát hiện gian lận sẽ bị khóa tài khoản vĩnh viễn.</li>
                          </ul>
                      </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t dark:border-slate-800">
                      <button
                          onClick={() => setShowInstructionModal(false)}
                          className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                          {instructionMission?.status === 'available' ? 'Hủy bỏ' : 'Đóng'}
                      </button>
                      
                      {instructionMission?.status === 'available' && (
                          <button
                              onClick={() => {
                                  setShowInstructionModal(false);
                                  handleAcceptMission(instructionMission._id);
                              }}
                              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/30"
                          >
                              Đồng ý và Tiếp tục
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
      {/* Zoomed Image Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setZoomedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={zoomedImage}
              alt="Zoomed instruction"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={() => setZoomedImage(null)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Success Modal */}
      {showWithdrawSuccessModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200 border-2 border-green-500">
                  <div className="mx-auto size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                      <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Gửi Yêu Cầu Thành Công!
                  </h3>
                  <div className="text-slate-600 dark:text-slate-400 mb-6 text-sm space-y-2">
                      <p>Hệ thống đã ghi nhận yêu cầu rút tiền của bạn.</p>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="font-bold text-purple-600 mb-1">Đã trừ {Number(lastWithdrawAmount).toLocaleString()}đ trong ví nhiệm vụ.</p>
                          <p>Vui lòng kiểm tra trạng thái tại lịch sử giao dịch.</p>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <button
                          onClick={() => navigate('/history')}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                      >
                          <span className="material-symbols-outlined">history</span>
                          Kiểm Tra Lịch Sử
                      </button>
                      <button
                          onClick={() => setShowWithdrawSuccessModal(false)}
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                          Đóng
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DailyTask;
