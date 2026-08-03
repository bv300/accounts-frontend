/**
 * Profit & Loss report page.
 */
import { Table, Typography, Card, DatePicker, Statistic, Row, Col, Input } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { PROFIT_AND_LOSS } from '../graphql/queries';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ProfitLossPage() {
    const { companyId } = useCompany();
    const today = dayjs();
    const [dates, setDates] = useState([today.startOf('year').month(3), today]);
    const [searchText, setSearchText] = useState('');

    const { data, loading } = useQuery(PROFIT_AND_LOSS, {
        variables: {
            companyId,
            fromDate: dates[0]?.format('YYYY-MM-DD'),
            toDate: dates[1]?.format('YYYY-MM-DD'),
        },
        skip: !companyId || !dates[0] || !dates[1],
    });

    const pl = data?.profitAndLoss;
    const q = searchText.trim().toLowerCase();

    const filteredRevenue = (q.length >= 4)
        ? (pl?.revenueItems || []).filter(r => r.accountName?.toLowerCase().includes(q))
        : (pl?.revenueItems || []);
    const filteredExpense = (q.length >= 4)
        ? (pl?.expenseItems || []).filter(r => r.accountName?.toLowerCase().includes(q))
        : (pl?.expenseItems || []);

    const cols = [
        { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
        { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
    ];

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Profit &amp; Loss</Title>
                <div className="page-header-actions">
                    <Input
                        allowClear
                        prefix={<SearchOutlined style={{ color: searchText.length >= 4 ? '#3b82f6' : '#bfbfbf' }} />}
                        placeholder="Search accounts… (min 4 chars)"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 220 }}
                        suffix={
                            searchText.length > 0 && searchText.length < 4
                                ? <span style={{ fontSize: 11, color: '#f59e0b' }}>{4 - searchText.length} more</span>
                                : null
                        }
                    />
                    <RangePicker value={dates} onChange={setDates} style={{ width: '100%' }} />
                </div>
            </div>

            {/* KPI Summary Cards */}
            <Row gutter={[16, 16]} className="report-stats-row" style={{ marginBottom: 20 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                        <Statistic title="Total Revenue" value={pl?.totalRevenue || 0} prefix="₹" valueStyle={{ color: '#10b981' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                        <Statistic title="Total Expenses" value={pl?.totalExpense || 0} prefix="₹" valueStyle={{ color: '#ef4444' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                        <Statistic title="Net Profit" value={pl?.netProfit || 0} prefix="₹"
                            valueStyle={{ color: parseFloat(pl?.netProfit || 0) >= 0 ? '#3b82f6' : '#ef4444' }} />
                    </Card>
                </Col>
            </Row>

            {/* Detail Tables */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Revenue" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={filteredRevenue} rowKey="accountId" loading={loading}
                            pagination={false} size="small" scroll={{ x: 'max-content' }} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Expenses" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={filteredExpense} rowKey="accountId" loading={loading}
                            pagination={false} size="small" scroll={{ x: 'max-content' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
