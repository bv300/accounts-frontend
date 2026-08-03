/**
 * Balance Sheet report page.
 */
import { Table, Typography, Card, DatePicker, Statistic, Row, Col, Input } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { BALANCE_SHEET } from '../graphql/queries';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function BalanceSheetPage() {
    const { companyId } = useCompany();
    const [asOfDate, setAsOfDate] = useState(dayjs());
    const [searchText, setSearchText] = useState('');

    const { data, loading } = useQuery(BALANCE_SHEET, {
        variables: { companyId, asOfDate: asOfDate?.format('YYYY-MM-DD') },
        skip: !companyId || !asOfDate,
    });

    const bs = data?.balanceSheet;
    const q = searchText.trim().toLowerCase();

    const filterItems = (items) =>
        q.length >= 4
            ? (items || []).filter(r => r.accountName?.toLowerCase().includes(q))
            : (items || []);

    const cols = [
        { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
        { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
    ];

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Balance Sheet</Title>
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
                    <DatePicker value={asOfDate} onChange={setAsOfDate} style={{ width: '100%' }} />
                </div>
            </div>

            {/* KPI Summary Cards */}
            <Row gutter={[16, 16]} className="report-stats-row" style={{ marginBottom: 20 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                        <Statistic title="Total Assets" value={bs?.totalAssets || 0} prefix="₹" valueStyle={{ color: '#3b82f6' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                        <Statistic title="Total Liabilities" value={bs?.totalLiabilities || 0} prefix="₹" valueStyle={{ color: '#ef4444' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                        <Statistic title="Total Equity" value={bs?.totalEquity || 0} prefix="₹" valueStyle={{ color: '#8b5cf6' }} />
                    </Card>
                </Col>
            </Row>

            {/* Detail Tables */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card title="Assets" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={filterItems(bs?.assets)} rowKey="accountId" loading={loading}
                            pagination={false} size="small" scroll={{ x: 'max-content' }} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Liabilities" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={filterItems(bs?.liabilities)} rowKey="accountId" loading={loading}
                            pagination={false} size="small" scroll={{ x: 'max-content' }} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Equity" bordered={false} style={{ borderRadius: 12 }}>
                        <Table columns={cols} dataSource={filterItems(bs?.equity)} rowKey="accountId" loading={loading}
                            pagination={false} size="small" scroll={{ x: 'max-content' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
