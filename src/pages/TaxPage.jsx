/**
 * Tax Rates page — display configured tax rates.
 */
import { Table, Tag, Typography, Card } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_TAX_RATES } from '../graphql/queries';

const { Title } = Typography;
const typeColors = { gst: 'blue', vat: 'green', cess: 'orange', custom: 'purple' };

export default function TaxPage() {
    const { companyId } = useCompany();
    const { data, loading } = useQuery(ALL_TAX_RATES, {
        variables: { companyId }, skip: !companyId,
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Type', dataIndex: 'taxType', key: 'taxType', render: t => <Tag color={typeColors[t]}>{t?.toUpperCase()}</Tag> },
        { title: 'Rate %', dataIndex: 'rate', key: 'rate', render: v => `${v}%`, align: 'right' },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 20 }}><PercentageOutlined /> Tax Rates</Title>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={data?.allTaxRates || []} rowKey="id"
                    loading={loading} pagination={{ pageSize: 15 }} size="middle"
                    expandable={{
                        expandedRowRender: r => (
                            <Table dataSource={r.components} rowKey="id" pagination={false} size="small"
                                columns={[
                                    { title: 'Component', dataIndex: 'name' },
                                    { title: 'Type', dataIndex: 'componentType', render: t => t?.toUpperCase() },
                                    { title: 'Rate %', dataIndex: 'rate', render: v => `${v}%`, align: 'right' },
                                ]}
                            />
                        ),
                    }}
                />
            </Card>
        </div>
    );
}
