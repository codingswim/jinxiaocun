import { useMemo, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Input,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  Image,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components';
import { formatMoney } from '@/utils';
import { mockCategories, type Category } from '@/mock';

// 新增/编辑表单字段类型
type CategoryFormValues = Pick<Category, 'name' | 'spec' | 'unit' | 'price'>;

function ProductsPage() {
  // 数据保存在前端内存数组中
  const [data, setData] = useState<Category[]>(mockCategories);
  // 搜索关键字
  const [keyword, setKeyword] = useState('');
  // 弹窗开关
  const [modalOpen, setModalOpen] = useState(false);
  // 正在编辑的记录 id（null 表示新增）
  const [editingId, setEditingId] = useState<number | null>(null);
  // 表单实例
  const [form] = Form.useForm<CategoryFormValues>();

  // 按品类名称过滤
  const filteredData = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return data;
    return data.filter((item) => item.name.toLowerCase().includes(kw));
  }, [data, keyword]);

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: Category) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      spec: record.spec,
      unit: record.unit,
      price: record.price,
    });
    setModalOpen(true);
  };

  // 删除（Popconfirm 二次确认后调用）
  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  // 提交（新增 / 编辑）
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId === null) {
        // 新增：自增 id，置于列表顶部；图片字段表单未收集，留空
        setData((prev) => {
          const maxId = prev.reduce((max, cur) => Math.max(max, cur.id), 0);
          const newCategory: Category = {
            id: maxId + 1,
            image: '',
            ...values,
          };
          return [newCategory, ...prev];
        });
        message.success('新增成功');
      } else {
        // 编辑：合并更新对应记录
        setData((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...values } : item,
          ),
        );
        message.success('编辑成功');
      }
      setModalOpen(false);
    } catch {
      // 校验失败，antd Form 会自动显示字段错误，无需额外处理
    }
  };

  // 取消
  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
  };

  // 表格列定义
  const columns: ColumnsType<Category> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '品类名称', dataIndex: 'name', key: 'name' },
    { title: '规格型号', dataIndex: 'spec', key: 'spec' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    {
      title: '默认单价（元）',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 140,
      render: (val: number) => formatMoney(val),
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 90,
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: '#bbb' }}>-</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除「${record.name}」吗？`}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="品类管理"
        description="维护商品品类基础信息，支持新增、编辑、删除与按名称搜索"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索品类名称"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 240 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          </Space>
        }
      />
      <Table<Category>
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
      />

      <Modal
        title={editingId === null ? '新增' : '编辑'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="品类名称"
            name="name"
            rules={[{ required: true, message: '请输入品类名称' }]}
          >
            <Input placeholder="请输入品类名称" maxLength={30} />
          </Form.Item>
          <Form.Item
            label="规格型号"
            name="spec"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号，如 550ml" maxLength={50} />
          </Form.Item>
          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位，如 瓶/包/提" maxLength={10} />
          </Form.Item>
          <Form.Item
            label="默认单价（元）"
            name="price"
            rules={[
              { required: true, message: '请输入默认单价' },
              { type: 'number', min: 0, message: '单价不能小于 0' },
            ]}
          >
            <InputNumber
              placeholder="请输入默认单价"
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonAfter="元"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductsPage;
