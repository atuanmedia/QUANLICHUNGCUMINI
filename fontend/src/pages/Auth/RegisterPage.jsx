// frontend/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import axios from 'axios';
import Spinner from '../../components/common/Spinner';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [citizenId, setCitizenId] = useState('');
    const [apartmentCode, setApartmentCode] = useState(''); // Để resident tự đăng ký và admin sẽ duyệt/gán căn hộ sau
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            setLoading(false);
            return;
        }

        try {
            // First, get apartment ID from apartmentCode
            let apartmentId = null;
            if (apartmentCode) {
                const { data: apartmentData } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/apartments/code/${apartmentCode.toUpperCase()}`);
                apartmentId = apartmentData._id;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
                username,
                email,
                password,
                role: 'resident', // Đăng ký mặc định là resident
                apartmentId, // Truyền apartmentId
                fullName,
                dateOfBirth,
                phoneNumber,
                citizenId
            }, config);

            navigate('/login?registered=true'); // Chuyển hướng về trang đăng nhập sau khi đăng ký thành công
        } catch (err) {
            console.error("Registration failed:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-light to-blue-300 animate-fade-in">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center transform transition-all duration-300 hover:scale-105">
                <h2 className="text-3xl font-bold text-primary mb-6 font-heading">Đăng ký tài khoản Resident</h2>
                {error && <div className="bg-danger/10 text-danger border border-danger p-3 rounded-md mb-4 animate-fade-in">{error}</div>}
                {loading && <Spinner />}
                <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            id="username"
                            label="Tên đăng nhập"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tên đăng nhập"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Địa chỉ email"
                            required
                        />
                    </div>
                    <Input
                        id="password"
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mật khẩu (ít nhất 6 ký tự)"
                        required
                    />
                    <Input
                        id="confirmPassword"
                        label="Xác nhận mật khẩu"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu"
                        required
                    />
                    <div className="md:col-span-2">
                        <Input
                            id="fullName"
                            label="Họ và tên"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            required
                        />
                    </div>
                    <Input
                        id="dateOfBirth"
                        label="Ngày sinh"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                    />
                    <Input
                        id="phoneNumber"
                        label="Số điện thoại"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="09xx xxx xxx"
                        required
                    />
                    <div className="md:col-span-2">
                        <Input
                            id="citizenId"
                            label="Số căn cước công dân (tùy chọn)"
                            type="text"
                            value={citizenId}
                            onChange={(e) => setCitizenId(e.target.value)}
                            placeholder="Số CCCD"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input
                            id="apartmentCode"
                            label="Mã căn hộ (nếu đã biết)"
                            type="text"
                            value={apartmentCode}
                            onChange={(e) => setApartmentCode(e.target.value)}
                            placeholder="Ví dụ: A101"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Button type="submit" className="w-full mt-4">
                            Đăng ký
                        </Button>
                    </div>
                </form>
                <div className="mt-6 text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;