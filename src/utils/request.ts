import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { message } from 'antd';

// 统一后端响应结构（可按后端实际约定调整）
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：可在此注入 token 等
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一处理业务码与错误提示
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code !== undefined && res.code !== 0 && res.code !== 200) {
      message.error(res.message || '请求出错');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data as any;
  },
  (error: AxiosError<ApiResponse>) => {
    const msg = error.response?.data?.message || error.message || '网络异常';
    message.error(msg);
    return Promise.reject(error);
  },
);

// 泛型请求方法封装
export function get<T>(url: string, params?: object, config?: AxiosRequestConfig) {
  return request.get<unknown, T>(url, { params, ...config });
}

export function post<T>(url: string, data?: object, config?: AxiosRequestConfig) {
  return request.post<unknown, T>(url, data, config);
}

export function put<T>(url: string, data?: object, config?: AxiosRequestConfig) {
  return request.put<unknown, T>(url, data, config);
}

export function del<T>(url: string, params?: object, config?: AxiosRequestConfig) {
  return request.delete<unknown, T>(url, { params, ...config });
}

export default request;
