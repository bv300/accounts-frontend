/**
 * Expenses page — list expense vouchers.
 */
import { useState } from 'react';
import { Table, Tag, Typography, Card, Input } from 'antd';
import { WalletOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_EXPENSE_VOUCHERS } from '../graphql/queries';

const { Title } = Typography;
const statusColors = { draft: 'default', approved: 'green', cancelled: 'red' };

export default function ExpensesPage() {
    const { companyId } = useCompany();
    const [searchText, setSearchText] = useState('');
    const { data, loading } = useQuery(ALL_EXPENSE_VOUCHERS, {
        variables: { companyId }, skip: !companyId,
    });

    const columns = [
        { title: 'Voucher #', dataIndex: 'voucherNumber', key: 'voucherNumber' },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 110, responsive: ['sm'] },
        { title: 'Paid To', dataIndex: 'paidTo', key: 'paidTo', ellipsis: true },
        { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'Tax', dataIndex: 'taxAmount', key: 'taxAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right', responsive: ['md'] },
        { title: 'Status', dataIndex: 'status', key: 'status', responsive: ['sm'], render: s => <Tag color={statusColors[s]}>{s?.toUpperCase()}</Tag> },
    ];

    const q = searchText.trim().toLowerCase();
    const filteredData = (q.length >= 4)
        ? (data?.allExpenseVouchers || []).filter(r =>
            r.voucherNumber?.toLowerCase().includes(q) ||
            r.paidTo?.toLowerCase().includes(q) ||
            r.status?.toLowerCase().includes(q) ||
            r.date?.toLowerCase().includes(q)
        )
        : (data?.allExpenseVouchers || []);

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><WalletOutlined /> Expense Vouchers</Title>
                <div className="page-header-actions">
                    <Input
                        allowClear
                        prefix={<SearchOutlined style={{ color: searchText.length >= 4 ? '#3b82f6' : '#bfbfbf' }} />}
                        placeholder="Search vouchers… (min 4 chars)"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 260 }}
                        suffix={
                            searchText.length > 0 && searchText.length < 4
                                ? <span style={{ fontSize: 11, color: '#f59e0b' }}>{4 - searchText.length} more</span>
                                : null
                        }
                    />
                </div>
            </div>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={filteredData} rowKey="id"
                    loading={loading} pagination={{ pageSize: 15, showSizeChanger: false }} size="middle"
                    scroll={{ x: 'max-content' }} />
            </Card>
        </div>
    );
}
