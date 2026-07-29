/**
 * Purchases page — list purchase invoices.
 */
import { Table, Tag, Typography, Card } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_PURCHASE_INVOICES } from '../graphql/queries';

const { Title } = Typography;
const statusColors = { draft: 'default', confirmed: 'green', cancelled: 'red' };

export default function PurchasesPage() {
    const { companyId } = useCompany();
    const { data, loading } = useQuery(ALL_PURCHASE_INVOICES, {
        variables: { companyId }, skip: !companyId,
    });

    const columns = [
        { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
        { title: 'Vendor', dataIndex: ['vendor', 'name'], key: 'vendor' },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
        { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={statusColors[s]}>{s?.toUpperCase()}</Tag> },
        { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'Balance', dataIndex: 'balanceDue', key: 'balanceDue', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        { title: 'ITC', dataIndex: 'itcEligible', key: 'itcEligible', render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 20 }}><ShoppingOutlined /> Purchase Invoices</Title>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={data?.allPurchaseInvoices || []} rowKey="id"
                    loading={loading} pagination={{ pageSize: 15 }} size="middle" />
            </Card>
        </div>
    );
}
