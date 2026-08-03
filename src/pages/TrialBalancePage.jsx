/**
 * Trial Balance report page.
 */
import { Table, Typography, Card, DatePicker, Space, Tag, Input } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { TRIAL_BALANCE } from '../graphql/queries';
import { useState } from 'react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const natureColors = { asset: 'blue', liability: 'red', equity: 'purple', revenue: 'green', expense: 'orange' };

export default function TrialBalancePage() {
    const { companyId } = useCompany();
    const [dates, setDates] = useState([null, null]);
    const [searchText, setSearchText] = useState('');

    const { data, loading } = useQuery(TRIAL_BALANCE, {
        variables: {
            companyId,
            fromDate: dates[0]?.format('YYYY-MM-DD'),
            toDate: dates[1]?.format('YYYY-MM-DD'),
        },
        skip: !companyId,
    });

    const rows = data?.trialBalance || [];
    const q = searchText.trim().toLowerCase();
    const filteredRows = (q.length >= 4)
        ? rows.filter(r =>
            r.accountName?.toLowerCase().includes(q) ||
            r.accountCode?.toLowerCase().includes(q) ||
            r.groupName?.toLowerCase().includes(q) ||
            r.nature?.toLowerCase().includes(q)
        )
        : rows;

    const totalDebit = filteredRows.reduce((s, r) => s + parseFloat(r.debit || 0), 0);
    const totalCredit = filteredRows.reduce((s, r) => s + parseFloat(r.credit || 0), 0);

    const columns = [
        { title: 'Code', dataIndex: 'accountCode', key: 'accountCode', width: 80, responsive: ['sm'] },
        { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
        { title: 'Group', dataIndex: 'groupName', key: 'groupName', responsive: ['md'] },
        { title: 'Nature', dataIndex: 'nature', key: 'nature', responsive: ['md'], render: n => <Tag color={natureColors[n]}>{n?.toUpperCase()}</Tag> },
        { title: 'Debit (₹)', dataIndex: 'debit', key: 'debit', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
        { title: 'Credit (₹)', dataIndex: 'credit', key: 'credit', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
    ];

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Trial Balance</Title>
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
                    <RangePicker onChange={setDates} style={{ width: '100%' }} />
                </div>
            </div>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={filteredRows} rowKey="accountId" loading={loading}
                    pagination={false} size="middle" scroll={{ x: 'max-content' }}
                    summary={() => (
                        <Table.Summary.Row style={{ background: '#f1f5f9', fontWeight: 700 }}>
                            <Table.Summary.Cell index={0} colSpan={4}><Text strong>TOTAL</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">₹ {totalDebit.toLocaleString('en-IN')}</Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">₹ {totalCredit.toLocaleString('en-IN')}</Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />
            </Card>
        </div>
    );
}
