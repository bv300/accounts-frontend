/**
 * Login page — JWT authentication form.
 */
import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_AUTH } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
    const [tokenAuth, { loading }] = useMutation(TOKEN_AUTH);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const { data } = await tokenAuth({ variables: values });
            login(data.tokenAuth.token);
            message.success('Login successful!');
            navigate('/');
        } catch (err) {
            message.error(err.message || 'Login failed');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        }}>
            <Card
                bordered={false}
                style={{
                    width: 420,
                    borderRadius: 16,
                    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ color: '#1e293b', marginBottom: 4 }}>📊 AccuBooks</Title>
                    <Text type="secondary">Sign in to your accounting dashboard</Text>
                </div>
                <Form layout="vertical" onFinish={onFinish} size="large">
                    <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block
                            style={{ height: 44, borderRadius: 8, fontWeight: 600, background: '#3b82f6' }}>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
