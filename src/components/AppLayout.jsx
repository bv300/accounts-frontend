/**
 * Application shell — Ant Design sidebar layout with navigation.
 */
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Select } from 'antd';
import {
    DashboardOutlined, BankOutlined, BookOutlined, ShoppingCartOutlined,
    ShoppingOutlined, WalletOutlined, BarChartOutlined, SettingOutlined,
    LogoutOutlined, UserOutlined, FileTextOutlined, PercentageOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { gql } from "@apollo/client";
import { useQuery } from '@apollo/client/react';
import { ALL_COMPANIES } from '../graphql/queries';
import { useEffect } from 'react';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/accounts', icon: <BankOutlined />, label: 'Chart of Accounts' },
    { key: '/journal', icon: <BookOutlined />, label: 'Journal Entries' },
    { key: '/sales', icon: <ShoppingCartOutlined />, label: 'Sales Invoices' },
    { key: '/purchases', icon: <ShoppingOutlined />, label: 'Purchases' },
    { key: '/expenses', icon: <WalletOutlined />, label: 'Expenses' },
    { key: '/tax', icon: <PercentageOutlined />, label: 'Tax Rates' },
    {
        key: 'reports', icon: <BarChartOutlined />, label: 'Reports',
        children: [
            { key: '/reports/trial-balance', icon: <FileTextOutlined />, label: 'Trial Balance' },
            { key: '/reports/profit-loss', icon: <FileTextOutlined />, label: 'Profit & Loss' },
            { key: '/reports/balance-sheet', icon: <FileTextOutlined />, label: 'Balance Sheet' },
        ]
    },
];

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { companyId, selectCompany } = useCompany();
    
    // Fetch all available companies
    const { data: companyData } = useQuery(ALL_COMPANIES);
    const companies = companyData?.allCompanies || [];

    // Auto-select the first company if none is currently selected
    useEffect(() => {
        if (!companyId && companies.length > 0) {
            selectCompany(companies[0].id);
        }
    }, [companyId, companies, selectCompany]);

    const userMenu = {
        items: [
            { key: 'profile', icon: <UserOutlined />, label: `${user?.firstName || user?.username}` },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
        ],
        onClick: ({ key }) => {
            if (key === 'logout') logout();
        },
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                width={250}
                style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
                }}
            >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Title level={4} style={{ color: '#60a5fa', margin: 0, letterSpacing: '0.5px' }}>
                        📊 AccuBooks
                     </Title>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Accounting Software</div>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ background: 'transparent', borderRight: 'none', marginTop: 8 }}
                />
            </Sider>
            <Layout>
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    zIndex: 10,
                }}>
                    <Space>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Active Company:</span>
                        <Select
                            placeholder="Select Company"
                            value={companyId}
                            onChange={(val) => selectCompany(val)}
                            style={{ width: 220 }}
                            options={companies.map(c => ({ value: c.id, label: c.name }))}
                        />
                    </Space>
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar style={{ backgroundColor: '#3b82f6' }} icon={<UserOutlined />} />
                            <span style={{ fontWeight: 500 }}>{user?.firstName || user?.username || 'User'}</span>
                        </Space>
                    </Dropdown>
                </Header>
                <Content style={{
                    margin: 24,
                    padding: 24,
                    background: '#f8fafc',
                    borderRadius: 12,
                    minHeight: 280,
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
