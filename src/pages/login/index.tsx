import { useState, type CSSProperties } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser } from '@/utils';

const { Title } = Typography;

interface LoginValues {
  username: string;
  password: string;
}

// 路由守卫 RequireAuth 传递的来源路径
interface LocationState {
  from?: { pathname: string };
}

// 页面外层容器样式：渐变背景 + 居中卡片
const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginValues>();

  // 登录成功后回跳到来源页，无来源则回首页
  const from = (location.state as LocationState | null)?.from?.pathname || '/';

  // 表单校验通过后触发：与本地存储的模拟用户比对
  const handleSubmit = (values: LoginValues) => {
    setSubmitting(true);
    try {
      const user = loginUser(values.username, values.password);
      if (!user) {
        // 账号或密码错误
        message.error('账号或密码错误');
        return;
      }
      message.success(`欢迎回来，${user.username}`);
      navigate(from, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <Card style={{ width: 380, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          登录
        </Title>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
              maxLength={20}
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              maxLength={30}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" block htmlType="submit" loading={submitting}>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          还没有账号？<Link to="/register">去注册</Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
