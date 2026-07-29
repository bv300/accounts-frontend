/**
 * Balance Sheet report page.
 */
import { Table, Typography, Card, DatePicker, Statistic, Row, Col } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { BALANCE_SHEET } from '../graphql/queries';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function BalanceSheetPage() {
    const { companyId } = useCompany();
    const [asOfDate, setAsOfDate] = useState(dayjs());

    const { data, loading } = useQuery(BALANCE_SHEET, {
        variables: { companyId, asOfDate: asOfDate?.format('YYYY-MM-DD') },
        skip: !companyId || !asOfDate,
    });

    const bs = data?.balanceSheet;
    const cols = [
        { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
        { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Balance Sheet</Title>
                <DatePicker value={asOfDate} onChange={setAsOfDate} />
            </div>

            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                        <Statistic title="Total Assets" value={bs?.totalAssets || 0} prefix="₹" valueStyle={{ color: '#3b82f6' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                        <Statistic title="Total Liabilities" value={bs?.totalLiabilities || 0} prefix="₹" valueStyle={{ color: '#ef4444' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                        <Statistic title="Total Equity" value={bs?.totalEquity || 0} prefix="₹" valueStyle={{ color: '#8b5cf6' }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Assets" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={bs?.assets || []} rowKey="accountId" loading={loading} pagination={false} size="small" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Liabilities" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={bs?.liabilities || []} rowKey="accountId" loading={loading} pagination={false} size="small" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Equity" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={bs?.equity || []} rowKey="accountId" loading={loading} pagination={false} size="small" />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
