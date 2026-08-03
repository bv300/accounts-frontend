/**
 * Sales Invoices page — list and view sales invoices.
 */
import { useState } from 'react';
import { Table, Tag, Typography, Card, Input } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_SALES_INVOICES } from '../graphql/queries';

const { Title } = Typography;

const statusColors = { draft: 'default', confirmed: 'green', cancelled: 'red' };

export default function SalesPage() {
    const { companyId } = useCompany();
    const [searchText, setSearchText] = useState('');
    const { data, loading } = useQuery(ALL_SALES_INVOICES, {
        variables: { companyId }, skip: !companyId,
    });

    const columns = [
        { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber', sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber) },
        { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 110, responsive: ['sm'] },
        { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 110, responsive: ['md'] },
        {
            title: 'Status', dataIndex: 'status', key: 'status', responsive: ['sm'],
            render: (s) => <Tag color={statusColors[s]}>{s?.toUpperCase()}</Tag>
        },
        { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right', responsive: ['lg'] },
        { title: 'Tax', dataIndex: 'taxAmount', key: 'taxAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right', responsive: ['lg'] },
        { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right' },
        {
            title: 'Balance Due', dataIndex: 'balanceDue', key: 'balanceDue', responsive: ['md'],
            render: v => {
                const val = parseFloat(v || 0);
                return <span style={{ color: val > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>₹ {val.toLocaleString('en-IN')}</span>;
            },
            align: 'right',
        },
    ];

    const q = searchText.trim().toLowerCase();
    const filteredData = (q.length >= 4)
        ? (data?.allSalesInvoices || []).filter(r =>
            r.invoiceNumber?.toLowerCase().includes(q) ||
            r.customer?.name?.toLowerCase().includes(q) ||
            r.status?.toLowerCase().includes(q) ||
            r.date?.toLowerCase().includes(q)
        )
        : (data?.allSalesInvoices || []);

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><ShoppingCartOutlined /> Sales Invoices</Title>
                <div className="page-header-actions">
                    <Input
                        allowClear
                        prefix={<SearchOutlined style={{ color: searchText.length >= 4 ? '#3b82f6' : '#bfbfbf' }} />}
                        placeholder="Search invoices… (min 4 chars)"
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
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
}
