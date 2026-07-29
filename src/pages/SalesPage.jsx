/**
 * Sales Invoices page — list and view sales invoices.
 */
import { Table, Tag, Typography, Card, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_SALES_INVOICES } from '../graphql/queries';

const { Title } = Typography;

const statusColors = { draft: 'default', confirmed: 'green', cancelled: 'red' };

export default function SalesPage() {
    const { companyId } = useCompany();
    const { data, loading } = useQuery(ALL_SALES_INVOICES, {
        variables: { companyId }, skip: !companyId,
    });

    const columns = [
        { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber', sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber) },
        { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
        { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 120 },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (s) => <Tag color={statusColors[s]}>{s?.toUpperCase()}</Tag>
        },
        { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'Tax', dataIndex: 'taxAmount', key: 'taxAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        {
            title: 'Balance Due', dataIndex: 'balanceDue', key: 'balanceDue',
            render: v => {
                const val = parseFloat(v || 0);
                return <span style={{ color: val > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>₹ {val.toLocaleString('en-IN')}</span>;
            },
            align: 'right',
        },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 20 }}><ShoppingCartOutlined /> Sales Invoices</Title>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={data?.allSalesInvoices || []} rowKey="id"
                    loading={loading} pagination={{ pageSize: 15 }} size="middle"
                />
            </Card>
        </div>
    );
}
