// export default Login
import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'
import EyeIcon from "../assets/eye.svg"
import EyeOffIcon from "../assets/eye_off.svg"

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { setAToKen, backendUrl } = useContext(AdminContext)
    const { setDToken } = useContext(DoctorContext)

    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            const response = await axios.post(`${backendUrl}/login`, { email, password })

            if (response.data.user) {
                const { role, token, ...userInfo } = response.data.user;

                if (role === 'admin' && state === 'Admin') {
                    localStorage.setItem('aToken', token)
                    setAToKen(token)
                    toast.success("Đăng nhập thành công!")
                    navigate('/admin-dashboard')
                } else if (role === 'doctor' && state === 'Doctor') {
                    localStorage.setItem('dToken', token)
                    setDToken(token)
                    sessionStorage.setItem('doctorInfo', JSON.stringify(userInfo));
                    toast.success("Đăng nhập bác sĩ thành công!")
                    navigate('/doctor-dashboard')
                } else {
                    toast.error("Vai trò không phù hợp đối với loại đăng nhập đã chọn.")
                }
                window.location.reload() 
            } else {
                toast.error("Login failed!")
            }

        } catch (error) {
            console.error("Login error:", error)
            toast.error("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.")
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'><span className='text-[#0091a1]'> {state}</span> Login</p>
                <div className='w-full'>
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type="email"
                        required
                    />
                </div>
                <div className='w-full relative'>
                    <p>Password</p>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1 pr-10'
                        type={showPassword ? "text" : "password"}
                        required
                    />
                    <img
                        src={showPassword ? EyeIcon : EyeOffIcon}
                        alt="Toggle Password Visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute top-1/2 right-3 transform -translate-y-1/2 w-6 h-6 cursor-pointer w-4 h-4 mt-3'
                    />
                </div>
                <button className='bg-[#0091a1] text-white w-full py-2 rounded-md text-base'>Login</button>
                {state === 'Admin'
                    ? <p>Doctor Login? <span className='text-[#0091a1] underline cursor-pointer' onClick={() => setState('Doctor')}>Click here</span></p>
                    : <p>Admin Login? <span className='text-[#0091a1] underline cursor-pointer' onClick={() => setState('Admin')}>Click here</span></p>
                }
            </div>
        </form>
    )
}

export default Login
