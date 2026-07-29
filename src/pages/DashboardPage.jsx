/**
 * Dashboard page — KPI cards and revenue/expense chart.
 */
import { Row, Col, Card, Statistic, Spin, DatePicker, Typography } from 'antd';
import {
    ArrowUpOutlined, ArrowDownOutlined, DollarOutlined,
    CreditCardOutlined, BankOutlined, WalletOutlined
} from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompany } from '../context/CompanyContext';
import { DASHBOARD, ALL_SALES_INVOICES, ALL_PURCHASE_INVOICES } from '../graphql/queries';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function DashboardPage() {
    const { companyId } = useCompany();
    const today = dayjs();
    const fyStart = today.month() >= 3 ? today.startOf('year').month(3).startOf('month') : today.subtract(1, 'year').month(3).startOf('month');

    const { data, loading } = useQuery(DASHBOARD, {
        variables: { companyId, fromDate: fyStart.format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') },
        skip: !companyId,
    });

    const d = data?.dashboard;

    const kpis = [
        { title: 'Total Revenue', value: d?.totalRevenue || 0, prefix: '₹', color: '#10b981', icon: <ArrowUpOutlined />, bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
        { title: 'Total Expenses', value: d?.totalExpenses || 0, prefix: '₹', color: '#ef4444', icon: <ArrowDownOutlined />, bg: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
        { title: 'Net Profit', value: d?.netProfit || 0, prefix: '₹', color: '#3b82f6', icon: <DollarOutlined />, bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
        { title: 'Receivables', value: d?.receivables || 0, prefix: '₹', color: '#f59e0b', icon: <CreditCardOutlined />, bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
        { title: 'Payables', value: d?.payables || 0, prefix: '₹', color: '#8b5cf6', icon: <WalletOutlined />, bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
        { title: 'Cash Balance', value: d?.cashBalance || 0, prefix: '₹', color: '#06b6d4', icon: <BankOutlined />, bg: 'linear-gradient(135deg, #cffafe, #a5f3fc)' },
    ];

    const chartData = [
        { name: 'Revenue', amount: parseFloat(d?.totalRevenue || 0) },
        { name: 'Expenses', amount: parseFloat(d?.totalExpenses || 0) },
        { name: 'Net Profit', amount: parseFloat(d?.netProfit || 0) },
    ];

    if (!companyId) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Title level={3} style={{ color: '#64748b' }}>Welcome to AccuBooks</Title>
                <p style={{ color: '#94a3b8' }}>Please create or select a company to get started.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
            </div>

            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    {kpis.map((kpi, i) => (
                        <Col xs={24} sm={12} lg={8} key={i}>
                            <Card
                                bordered={false}
                                style={{
                                    background: kpi.bg,
                                    borderRadius: 12,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}
                            >
                                <Statistic
                                    title={<span style={{ color: '#475569', fontWeight: 500 }}>{kpi.title}</span>}
                                    value={kpi.value}
                                    prefix={kpi.prefix}
                                    valueStyle={{ color: kpi.color, fontWeight: 700, fontSize: 24 }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Card
                    title="Revenue vs Expenses"
                    bordered={false}
                    style={{ marginTop: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Spin>
        </div>
    );
}
