// 用户认证工具模块
// 仅前端模拟实现：使用 localStorage 持久化注册用户与登录状态，不请求后端接口

// localStorage 存储键
const USERS_KEY = 'auth_users'; // 已注册用户列表
const CURRENT_USER_KEY = 'auth_current_user'; // 当前登录用户（登录凭证）

// 已注册的模拟用户
export interface MockUser {
  username: string;
  password: string;
  createdAt: number; // 注册时间戳
}

// 当前登录用户信息（脱敏，不含密码）
export interface CurrentUser {
  username: string;
  loginAt: number; // 登录时间戳
}

// 读取已注册用户列表（解析失败时返回空数组，保证容错）
function loadUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  } catch {
    return [];
  }
}

// 持久化已注册用户列表
function saveUsers(users: MockUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 校验账号是否已存在
export function isRegistered(username: string): boolean {
  const target = username.trim();
  if (!target) return false;
  return loadUsers().some((u) => u.username === target);
}

// 注册：账号或密码为空、账号已存在均返回 false，由调用方给出提示
export function registerUser(username: string, password: string): boolean {
  const name = username.trim();
  if (!name || !password) return false;
  if (isRegistered(name)) return false;
  const users = loadUsers();
  users.push({ username: name, password, createdAt: Date.now() });
  saveUsers(users);
  return true;
}

// 登录：与本地存储的模拟用户比对，成功则写入登录凭证并返回当前用户；失败返回 null
export function loginUser(username: string, password: string): CurrentUser | null {
  const name = username.trim();
  const user = loadUsers().find((u) => u.username === name);
  if (!user || user.password !== password) return null;
  const current: CurrentUser = {
    username: user.username,
    loginAt: Date.now(),
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
  return current;
}

// 退出登录：仅清除登录凭证，保留已注册用户数据
export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// 获取当前登录用户（未登录返回 null）
export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

// 判断是否已登录
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
