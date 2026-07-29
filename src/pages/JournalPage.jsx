/**
 * Journal Entries page — list and create journal entries.
 */
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Typography, Card, Tag, Space, InputNumber } from 'antd';
import { PlusOutlined, BookOutlined, MinusCircleOutlined } from '@ant-design/icons';
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
        { title: '#', dataIndex: 'voucherNumber', key: 'voucherNumber', width: 80 },
        {
            title: 'Type', dataIndex: 'voucherType', key: 'voucherType',
            render: (t) => <Tag color={voucherColors[t]}>{t?.toUpperCase()}</Tag>
        },
        { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
        { title: 'Narration', dataIndex: 'narration', key: 'narration', ellipsis: true },
        {
            title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount',
            render: (v) => `₹ ${parseFloat(v || 0).toLocaleString('en-IN')}`, align: 'right',
        },
        {
            title: 'Status', dataIndex: 'isPosted', key: 'isPosted',
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}><BookOutlined /> Journal Entries</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                    New Entry
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Table columns={columns} dataSource={data?.allJournalEntries || []} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15 }} size="middle"
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                dataSource={record.lines} rowKey="id" pagination={false} size="small"
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
                onOk={() => form.submit()} confirmLoading={creating} width={700}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Space style={{ width: '100%' }} direction="vertical">
                        <Space>
                            <Form.Item name="fiscalYearId" label="Fiscal Year" rules={[{ required: true }]}>
                                <Select style={{ width: 200 }} placeholder="Select FY">
                                    {(fyData?.allFiscalYears || []).map(fy => (
                                        <Select.Option key={fy.id} value={fy.id}>{fy.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                <DatePicker />
                            </Form.Item>
                            <Form.Item name="voucherType" label="Type" initialValue="journal">
                                <Select style={{ width: 120 }}>
                                    <Select.Option value="journal">Journal</Select.Option>
                                    <Select.Option value="payment">Payment</Select.Option>
                                    <Select.Option value="receipt">Receipt</Select.Option>
                                    <Select.Option value="contra">Contra</Select.Option>
                                </Select>
                            </Form.Item>
                        </Space>
                        <Form.Item name="narration" label="Narration">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.List name="lines" initialValue={[{}, {}]}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <Space key={key} style={{ display: 'flex', width: '100%' }} align="baseline">
                                            <Form.Item {...rest} name={[name, 'accountId']} rules={[{ required: true }]}>
                                                <Select style={{ width: 250 }} placeholder="Account" showSearch
                                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                                    {(accountsData?.allAccounts || []).map(a => (
                                                        <Select.Option key={a.id} value={a.id}>{a.name}</Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item {...rest} name={[name, 'debit']}>
                                                <InputNumber placeholder="Debit" min={0} style={{ width: 120 }} />
                                            </Form.Item>
                                            <Form.Item {...rest} name={[name, 'credit']}>
                                                <InputNumber placeholder="Credit" min={0} style={{ width: 120 }} />
                                            </Form.Item>
                                            {fields.length > 2 && <MinusCircleOutlined onClick={() => remove(name)} />}
                                        </Space>
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
