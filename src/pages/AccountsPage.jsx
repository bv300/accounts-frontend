/**
 * Chart of Accounts page — display and create accounts.
 */
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Typography, Space, Card, InputNumber } from 'antd';
import { PlusOutlined, BankOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_ACCOUNTS, ALL_ACCOUNT_GROUPS, CREATE_ACCOUNT } from '../graphql/queries';

const { Title } = Typography;

const natureColors = {
    asset: 'blue', liability: 'red', equity: 'purple', revenue: 'green', expense: 'orange',
};

export default function AccountsPage() {
    const { companyId } = useCompany();
    const [modalOpen, setModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const { data, loading, refetch } = useQuery(ALL_ACCOUNTS, {
        variables: { companyId }, skip: !companyId,
    });
    const { data: groupsData } = useQuery(ALL_ACCOUNT_GROUPS, {
        variables: { companyId }, skip: !companyId,
    });
    const [createAccount, { loading: creating }] = useMutation(CREATE_ACCOUNT);

    const columns = [
        { title: 'Code', dataIndex: 'code', key: 'code', width: 90, sorter: (a, b) => (a.code || '').localeCompare(b.code || '') },
        { title: 'Account Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Group', dataIndex: ['group', 'name'], key: 'group', responsive: ['sm'] },
        {
            title: 'Nature', key: 'nature', responsive: ['sm'],
            render: (_, r) => <Tag color={natureColors[r.group?.nature]}>{r.group?.nature?.toUpperCase()}</Tag>
        },
        {
            title: 'Opening Bal.', dataIndex: 'openingBalance', key: 'openingBalance',
            render: (val) => `₹ ${parseFloat(val || 0).toLocaleString('en-IN')}`,
            align: 'right', responsive: ['md'],
        },
        {
            title: 'Status', dataIndex: 'isActive', key: 'isActive', responsive: ['md'],
            render: (active) => <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
        },
    ];

    const handleCreate = async (values) => {
        await createAccount({ variables: { companyId, ...values } });
        setModalOpen(false);
        form.resetFields();
        refetch();
    };

    const q = searchText.trim().toLowerCase();
    const filteredData = (q.length >= 4)
        ? (data?.allAccounts || []).filter(r =>
            r.name?.toLowerCase().includes(q) ||
            r.code?.toLowerCase().includes(q) ||
            r.group?.name?.toLowerCase().includes(q) ||
            r.group?.nature?.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q)
        )
        : (data?.allAccounts || []);

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><BankOutlined /> Chart of Accounts</Title>
                <div className="page-header-actions">
                    <Input
                        allowClear
                        prefix={<SearchOutlined style={{ color: searchText.length >= 4 ? '#3b82f6' : '#bfbfbf' }} />}
                        placeholder="Search accounts… (min 4 chars)"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 260 }}
                        suffix={
                            searchText.length > 0 && searchText.length < 4
                                ? <span style={{ fontSize: 11, color: '#f59e0b' }}>{4 - searchText.length} more</span>
                                : null
                        }
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                        New Account
                    </Button>
                </div>
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: false }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            <Modal
                title="Create New Account" open={modalOpen} onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()} confirmLoading={creating}
                style={{ top: 20 }}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="groupId" label="Account Group" rules={[{ required: true }]}>
                        <Select placeholder="Select group">
                            {(groupsData?.allAccountGroups || []).map(g => (
                                <Select.Option key={g.id} value={g.id}>{g.name} ({g.nature})</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="name" label="Account Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Cash in Hand" />
                    </Form.Item>
                    <Form.Item name="code" label="Account Code">
                        <Input placeholder="e.g. 1001" />
                    </Form.Item>
                    <Form.Item name="openingBalance" label="Opening Balance">
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
