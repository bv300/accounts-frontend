/**
 * Expenses page — list expense vouchers.
 */
import { Table, Tag, Typography, Card } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_EXPENSE_VOUCHERS } from '../graphql/queries';

const { Title } = Typography;
const statusColors = { draft: 'default', approved: 'green', cancelled: 'red' };

export default function ExpensesPage() {
    const { companyId } = useCompany();
    const { data, loading } = useQuery(ALL_EXPENSE_VOUCHERS, {
        variables: { companyId }, skip: !companyId,
    });

    const columns = [
        { title: 'Voucher #', dataIndex: 'voucherNumber', key: 'voucherNumber' },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
        { title: 'Paid To', dataIndex: 'paidTo', key: 'paidTo' },
        { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'Tax', dataIndex: 'taxAmount', key: 'taxAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={statusColors[s]}>{s?.toUpperCase()}</Tag> },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 20 }}><WalletOutlined /> Expense Vouchers</Title>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={data?.allExpenseVouchers || []} rowKey="id"
                    loading={loading} pagination={{ pageSize: 15 }} size="middle" />
            </Card>
        </div>
    );
}
