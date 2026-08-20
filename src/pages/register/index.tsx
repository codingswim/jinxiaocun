import { useState, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { isRegistered, registerUser } from '@/utils';

const { Title } = Typography;

interface RegisterValues {
  username: string;
  password: string;
  confirm: string;
}

// 页面外层容器样式：渐变背景 + 居中卡片
const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<RegisterValues>();

  // 表单校验通过后触发：写入本地存储的模拟用户
  const handleSubmit = (values: RegisterValues) => {
    setSubmitting(true);
    try {
      // 兜底校验账号是否重复（字段级异步校验已先拦截一次）
      const ok = registerUser(values.username, values.password);
      if (!ok) {
        message.error('该账号已被注册');
        return;
      }
      message.success('注册成功，请登录');
      navigate('/login', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <Card style={{ width: 380, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          注册
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
            rules={[
              { required: true, message: '请输入账号' },
              { min: 3, message: '账号至少 3 个字符' },
              {
                // 实时校验账号是否已被注册
                validator: (_, value) => {
                  if (!value || !value.trim()) return Promise.resolve();
                  if (isRegistered(value)) {
                    return Promise.reject(new Error('该账号已被注册'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
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
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              maxLength={30}
            />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              maxLength={30}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" block htmlType="submit" loading={submitting}>
              注册
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          已有账号？<Link to="/login">去登录</Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;
