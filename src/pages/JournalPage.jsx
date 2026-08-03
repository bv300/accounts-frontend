/**
 * Journal Entries page — list and create journal entries.
 */
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Typography, Card, Tag, Space, InputNumber } from 'antd';
import { PlusOutlined, BookOutlined, MinusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client/react';
import { useCompany } from '../context/CompanyContext';
import { ALL_JOURNAL_ENTRIES, ALL_ACCOUNTS, ALL_FISCAL_YEARS, CREATE_JOURNAL_ENTRY } from '../graphql/queries';
import dayjs from 'dayjs';

const { Title } = Typography;

const voucherColors = {
    journal: 'blue', sales: 'green', purchase: 'orange', payment: 'red', receipt: 'cyan', contra: 'purple',
};

export default function JournalPage() {
    const { companyId } = useCompany();
    const [modalOpen, setModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const { data, loading, refetch } = useQuery(ALL_JOURNAL_ENTRIES, {
        variables: { companyId }, skip: !companyId,
    });
    const { data: accountsData } = useQuery(ALL_ACCOUNTS, {
        variables: { companyId }, skip: !companyId,
    });
    const { data: fyData } = useQuery(ALL_FISCAL_YEARS, {
        variables: { companyId }, skip: !companyId,
    });
    const [createEntry, { loading: creating }] = useMutation(CREATE_JOURNAL_ENTRY);

    const columns = [
        { title: '#', dataIndex: 'voucherNumber', key: 'voucherNumber', width: 70 },
        {
            title: 'Type', dataIndex: 'voucherType', key: 'voucherType',
            render: (t) => <Tag color={voucherColors[t]}>{t?.toUpperCase()}</Tag>
        },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 110 },
        { title: 'Narration', dataIndex: 'narration', key: 'narration', ellipsis: true, responsive: ['sm'] },
        {
            title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount',
            render: (v) => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right',
        },
        {
            title: 'Status', dataIndex: 'isPosted', key: 'isPosted', responsive: ['md'],
            render: (p) => <Tag color={p ? 'green' : 'default'}>{p ? 'Posted' : 'Draft'}</Tag>
        },
    ];

    const handleCreate = async (values) => {
        const variables = {
            companyId,
            fiscalYearId: values.fiscalYearId,
            date: values.date.format('YYYY-MM-DD'),
            narration: values.narration,
            voucherType: values.voucherType || 'journal',
            lines: values.lines.map(l => ({
                accountId: l.accountId,
                debit: l.debit || '0',
                credit: l.credit || '0',
            })),
        };
        await createEntry({ variables });
        setModalOpen(false);
        form.resetFields();
        refetch();
    };

    const q = searchText.trim().toLowerCase();
    const filteredData = (q.length >= 4)
        ? (data?.allJournalEntries || []).filter(r =>
            r.voucherNumber?.toLowerCase().includes(q) ||
            r.voucherType?.toLowerCase().includes(q) ||
            r.narration?.toLowerCase().includes(q) ||
            r.date?.toLowerCase().includes(q)
        )
        : (data?.allJournalEntries || []);

    return (
        <div>
            <div className="page-header">
                <Title level={3} style={{ margin: 0 }}><BookOutlined /> Journal Entries</Title>
                <div className="page-header-actions">
                    <Input
                        allowClear
                        prefix={<SearchOutlined style={{ color: searchText.length >= 4 ? '#3b82f6' : '#bfbfbf' }} />}
                        placeholder="Search entries… (min 4 chars)"
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
                        New Entry
                    </Button>
                </div>
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: false }} size="middle"
                    scroll={{ x: 'max-content' }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                dataSource={record.lines} rowKey="id" pagination={false} size="small"
                                scroll={{ x: 'max-content' }}
                                columns={[
                                    { title: 'Account', dataIndex: ['account', 'name'] },
                                    { title: 'Debit', dataIndex: 'debit', render: v => v > 0 ? `₹ ${parseFloat(v).toLocaleString('en-IN')}` : '-', align: 'right' },
                                    { title: 'Credit', dataIndex: 'credit', render: v => v > 0 ? `₹ ${parseFloat(v).toLocaleString('en-IN')}` : '-', align: 'right' },
                                ]}
                            />
                        ),
                    }}
                />
            </Card>

            <Modal title="Create Journal Entry" open={modalOpen} onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()} confirmLoading={creating} width="min(700px, 95vw)" style={{ top: 20 }}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Space style={{ width: '100%' }} direction="vertical">
                        {/* Top row — wraps on mobile */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <Form.Item name="fiscalYearId" label="Fiscal Year" rules={[{ required: true }]} style={{ flex: '1 1 160px', marginBottom: 0 }}>
                                <Select style={{ width: '100%' }} placeholder="Select FY">
                                    {(fyData?.allFiscalYears || []).map(fy => (
                                        <Select.Option key={fy.id} value={fy.id}>{fy.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]} style={{ flex: '1 1 130px', marginBottom: 0 }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="voucherType" label="Type" initialValue="journal" style={{ flex: '1 1 110px', marginBottom: 0 }}>
                                <Select style={{ width: '100%' }}>
                                    <Select.Option value="journal">Journal</Select.Option>
                                    <Select.Option value="payment">Payment</Select.Option>
                                    <Select.Option value="receipt">Receipt</Select.Option>
                                    <Select.Option value="contra">Contra</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item name="narration" label="Narration">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.List name="lines" initialValue={[{}, {}]}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <div key={key} className="journal-line-space"
                                            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                                            <Form.Item {...rest} name={[name, 'accountId']} rules={[{ required: true }]} style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                                <Select style={{ width: '100%' }} placeholder="Account" showSearch
                                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                                    {(accountsData?.allAccounts || []).map(a => (
                                                        <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item {...rest} name={[name, 'debit']} style={{ flex: '1 1 100px', marginBottom: 0 }}>
                                                <InputNumber placeholder="Debit" min={0} style={{ width: '100%' }} />
                                            </Form.Item>
                                            <Form.Item {...rest} name={[name, 'credit']} style={{ flex: '1 1 100px', marginBottom: 0 }}>
                                                <InputNumber placeholder="Credit" min={0} style={{ width: '100%' }} />
                                            </Form.Item>
                                            {fields.length > 2 && <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444' }} />}
                                        </div>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Line</Button>
                                </>
                            )}
                        </Form.List>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
}
