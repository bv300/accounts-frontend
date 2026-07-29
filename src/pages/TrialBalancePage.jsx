/**
 * Trial Balance report page.
 */
import { Table, Typography, Card, DatePicker, Space, Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
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

    const { data, loading } = useQuery(TRIAL_BALANCE, {
        variables: {
            companyId,
            fromDate: dates[0]?.format('YYYY-MM-DD'),
            toDate: dates[1]?.format('YYYY-MM-DD'),
        },
        skip: !companyId,
    });

    const rows = data?.trialBalance || [];
    const totalDebit = rows.reduce((s, r) => s + parseFloat(r.debit || 0), 0);
    const totalCredit = rows.reduce((s, r) => s + parseFloat(r.credit || 0), 0);

    const columns = [
        { title: 'Code', dataIndex: 'accountCode', key: 'accountCode', width: 80 },
        { title: 'Account', dataIndex: 'accountName', key: 'accountName' },
        { title: 'Group', dataIndex: 'groupName', key: 'groupName' },
        { title: 'Nature', dataIndex: 'nature', key: 'nature', render: n => <Tag color={natureColors[n]}>{n?.toUpperCase()}</Tag> },
        { title: 'Debit (₹)', dataIndex: 'debit', key: 'debit', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
        { title: 'Credit (₹)', dataIndex: 'credit', key: 'credit', render: v => parseFloat(v || 0).toLocaleString('en-IN'), align: 'right' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}><FileTextOutlined /> Trial Balance</Title>
                <RangePicker onChange={setDates} />
            </div>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={rows} rowKey="accountId" loading={loading}
                    pagination={false} size="middle"
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
