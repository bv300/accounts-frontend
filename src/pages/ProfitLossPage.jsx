/**
 * Profit & Loss report page.
 */
import { Table, Typography, Card, DatePicker, Statistic, Row, Col } from 'antd';
import { FileTextOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { PROFIT_AND_LOSS } from '../graphql/queries';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ProfitLossPage() {
    const { companyId } = useCompany();
    const today = dayjs();
    const [dates, setDates] = useState([today.startOf('year').month(3), today]);

    const { data, loading } = useQuery(PROFIT_AND_LOSS, {
        variables: {
            companyId,
            fromDate: dates[0]?.format('YYYY-MM-DD'),
            toDate: dates[1]?.format('YYYY-MM-DD'),
        },
        skip: !companyId || !dates[0] || !dates[1],
    });

    const pl = data?.profitAndLoss;
    const cols = [
        { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
        { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Profit & Loss</Title>
                <RangePicker value={dates} onChange={setDates} />
            </div>

            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                        <Statistic title="Total Revenue" value={pl?.totalRevenue || 0} prefix="₹" valueStyle={{ color: '#10b981' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                        <Statistic title="Total Expenses" value={pl?.totalExpense || 0} prefix="₹" valueStyle={{ color: '#ef4444' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                        <Statistic title="Net Profit" value={pl?.netProfit || 0} prefix="₹"
                            valueStyle={{ color: parseFloat(pl?.netProfit || 0) >= 0 ? '#3b82f6' : '#ef4444' }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Revenue" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={pl?.revenueItems || []} rowKey="accountId" loading={loading}
                            pagination={false} size="small" />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Expenses" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={pl?.expenseItems || []} rowKey="accountId" loading={loading}
                            pagination={false} size="small" />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
