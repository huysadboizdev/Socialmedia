import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminMissions = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMission, setEditingMission] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        type: 'like',
        reward: 0,
        isActive: true
    });

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/missions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMissions(res.data.missions);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch missions');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingMission 
                ? `${API_URL}/api/admin/mission/update`
                : `${API_URL}/api/admin/mission/create`;
            
            const payload = editingMission 
                ? { ...formData, missionId: editingMission._id }
                : formData;

            const res = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(editingMission ? 'Cập nhật thành công!' : 'Tạo nhiệm vụ thành công!');
                setIsModalOpen(false);
                setEditingMission(null);
                setFormData({ title: '', link: '', type: 'like', reward: 0, isActive: true });
                fetchMissions();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleEdit = (mission) => {
        setEditingMission(mission);
        setFormData({
            title: mission.title,
            link: mission.link || '',
            type: mission.type,
            reward: mission.reward,
            isActive: mission.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa nhiệm vụ này?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/mission/delete`, { missionId: id }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã xóa nhiệm vụ');
                fetchMissions();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý Nhiệm Vụ</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Tạo và quản lý các nhiệm vụ kiếm tiền cho người dùng</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingMission(null);
                        setFormData({ title: '', link: '', type: 'like', reward: 0, isActive: true });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    Thêm Nhiệm Vụ
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên Nhiệm Vụ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loại</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thưởng (VNĐ)</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                                </tr>
                            ) : missions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Chưa có nhiệm vụ nào</td>
                                </tr>
                            ) : (
                                missions.map((mission) => (
                                    <tr key={mission._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{mission.title}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 max-w-xs truncate">
                                            <a href={mission.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{mission.link}</a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase border ${
                                                mission.type === 'like' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                mission.type === 'follow' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                                {mission.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                            {mission.reward?.toLocaleString()} đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             <span className={`inline-block w-2.5 h-2.5 rounded-full ${mission.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleEdit(mission)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(mission._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                {editingMission ? 'Chỉnh Sửa Nhiệm Vụ' : 'Tạo Nhiệm Vụ Mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên Nhiệm Vụ</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleInputChange} 
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium"
                                    placeholder="Ví dụ: Like Fanpage A"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Link Nhiệm Vụ</label>
                                <input 
                                    type="text" 
                                    name="link" 
                                    value={formData.link} 
                                    onChange={handleInputChange} 
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loại</label>
                                    <select 
                                        name="type" 
                                        value={formData.type} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-medium appearance-none"
                                    >
                                        <option value="like">Like</option>
                                        <option value="follow">Follow</option>
                                        <option value="share">Share</option>
                                        <option value="comment">Comment</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tiền Thưởng</label>
                                    <input 
                                        type="number" 
                                        name="reward" 
                                        value={formData.reward} 
                                        onChange={handleInputChange} 
                                        required
                                        min="0"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    name="isActive" 
                                    id="isActive"
                                    checked={formData.isActive} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-gray-300"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Kích hoạt nhiệm vụ ngay</label>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 dark:shadow-violet-900/20 active:scale-95 transition-all mt-2"
                            >
                                {editingMission ? 'Lưu Thay Đổi' : 'Tạo Nhiệm Vụ'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMissions;
