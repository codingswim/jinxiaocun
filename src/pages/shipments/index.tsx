import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Input,
  DatePicker,
  Row,
  Col,
  Popconfirm,
  message,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { PageHeader } from '@/components';
import { formatMoney } from '@/utils';
import {
  mockShipments,
  mockCustomers,
  mockCategories,
  type Shipment,
} from '@/mock';
import ShipmentFormModal from './ShipmentFormModal';

const { RangePicker } = DatePicker;

// 已应用的筛选条件（日期转为字符串便于比较）
interface AppliedFilter {
  start: string;
  end: string;
  customer: string;
  category: string;
}

function ShipmentsPage() {
  // 数据保存在前端内存数组中
  const [data, setData] = useState<Shipment[]>(mockShipments);

  // 筛选输入态
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [customer, setCustomer] = useState('');
  const [category, setCategory] = useState('');
  const [applied, setApplied] = useState<AppliedFilter>({
    start: '',
    end: '',
    customer: '',
    category: '',
  });

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Shipment | null>(null);

  // 品类名称 -> 图片地址 映射（用于主列表展示品类图片）
  const categoryImageMap = useMemo(() => {
    const map = new Map<string, string>();
    mockCategories.forEach((c) => map.set(c.name, c.image));
    return map;
  }, []);

  // 按已应用筛选条件过滤
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (applied.start && item.deliveryDate < applied.start) return false;
      if (applied.end && item.deliveryDate > applied.end) return false;
      if (
        applied.customer &&
        !item.customer.toLowerCase().includes(applied.customer.toLowerCase())
      )
        return false;
      if (
        applied.category &&
        !item.category.toLowerCase().includes(applied.category.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, applied]);

  // 生成编号：PO + 年月日 + 当日序号（3 位）
  const generateId = useCallback(() => {
    const prefix = `PO${dayjs().format('YYYYMMDD')}`;
    const count = data.filter((d) => d.id.startsWith(prefix)).length;
    return `${prefix}${String(count + 1).padStart(3, '0')}`;
  }, [data]);

  // 查询 / 重置
  const handleQuery = () => {
    setApplied({
      start: dateRange?.[0]?.format('YYYY-MM-DD') ?? '',
      end: dateRange?.[1]?.format('YYYY-MM-DD') ?? '',
      customer: customer.trim(),
      category: category.trim(),
    });
  };
  const handleReset = () => {
    setDateRange(null);
    setCustomer('');
    setCategory('');
    setApplied({ start: '', end: '', customer: '', category: '' });
  };

  // 新增 / 编辑
  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };
  const handleEdit = (record: Shipment) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  // 删除
  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  // Modal 提交（新增 / 编辑）→ 刷新父列表
  const handleSubmit = (record: Shipment) => {
    if (editingRecord) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? record : item)),
      );
      message.success('编辑成功');
    } else {
      setData((prev) => [record, ...prev]);
      message.success('新增成功');
    }
    setModalOpen(false);
    setEditingRecord(null);
  };
  const handleCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

  // 导出 Excel（导出当前筛选结果）
  // 列顺序与列表展示保持一致：编号 | 客户 | 联系方式 | 品类 | 数量 | 单价 | 总金额 | 交货日期 | 已回款情况 | 未回货款 | 备注
  const handleExport = async () => {
    if (filteredData.length === 0) {
      message.warning('当前没有可导出的数据');
      return;
    }

    const colDefs: Array<{
      header: string;
      key: string;
      width: number;
      numFmt?: string;
    }> = [
      { header: '编号', key: 'id', width: 20 },
      { header: '客户', key: 'customer', width: 12 },
      { header: '联系方式', key: 'contact', width: 14 },
      { header: '品类', key: 'category', width: 12 },
      { header: '数量', key: 'quantity', width: 8 },
      { header: '单价', key: 'price', width: 10, numFmt: '0.00' },
      { header: '总金额', key: 'totalAmount', width: 12, numFmt: '0.00' },
      { header: '交货日期', key: 'deliveryDate', width: 14 },
      { header: '已回款情况', key: 'paidAmount', width: 14, numFmt: '0.00' },
      { header: '未回货款', key: 'unpaidAmount', width: 12, numFmt: '0.00' },
      { header: '备注', key: 'remark', width: 22 },
    ];

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('出货明细');
    const colCount = colDefs.length;

    // 列宽
    colDefs.forEach((c, i) => {
      ws.getColumn(i + 1).width = c.width;
    });

    // 第 1 行：标题「出货明细」，合并所有单元格
    const titleRow = ws.getRow(1);
    titleRow.height = 26;
    ws.mergeCells(1, 1, 1, colCount);
    const titleCell = titleRow.getCell(1);
    titleCell.value = '出货明细';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 第 2 行：表头（加粗、居中）
    const headerRow = ws.getRow(2);
    headerRow.height = 20;
    colDefs.forEach((c, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = c.header;
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 第 3 行起：数据
    filteredData.forEach((r, idx) => {
      const row = ws.getRow(idx + 3);
      const rowData: Record<string, string | number> = {
        id: r.id,
        customer: r.customer,
        contact: r.contact,
        category: r.category,
        quantity: r.quantity,
        price: r.price,
        totalAmount: r.totalAmount,
        deliveryDate: dayjs(r.deliveryDate).format('YYYY-MM-DD'),
        paidAmount: r.paidAmount,
        unpaidAmount: r.unpaidAmount,
        remark: r.remark,
      };
      colDefs.forEach((c, i) => {
        const cell = row.getCell(i + 1);
        cell.value = rowData[c.key];
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (c.numFmt) cell.numFmt = c.numFmt;
      });
    });

    // 生成并下载
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `出货明细_${dayjs().format('YYYYMMDD')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success(`已导出 ${filteredData.length} 条记录`);
  };

  // 表格列
  const columns: ColumnsType<Shipment> = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 150, fixed: 'left' },
    { title: '客户', dataIndex: 'customer', key: 'customer', width: 90 },
    { title: '联系方式', dataIndex: 'contact', key: 'contact', width: 130 },
    { title: '品类', dataIndex: 'category', key: 'category', width: 100 },
    {
      title: '品类图片',
      key: 'categoryImage',
      width: 90,
      render: (_, record) => {
        const url = categoryImageMap.get(record.category);
        return url ? (
          <Image
            src={url}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: '#bbb' }}>-</span>
        );
      },
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (val: number) => formatMoney(val),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 110,
      align: 'right',
      render: (val: number) => formatMoney(val),
    },
    { title: '交货日期', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 120 },
    {
      title: '已回款情况',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right',
      render: (val: number, record) => (
        <span
          style={{
            color:
              val >= record.totalAmount && record.totalAmount > 0
                ? '#52c41a'
                : 'inherit',
          }}
        >
          {formatMoney(val)}
        </span>
      ),
    },
    {
      title: '未回货款',
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            color: val > 0 ? '#ff4d4f' : '#52c41a',
            fontWeight: val > 0 ? 600 : 400,
          }}
        >
          {formatMoney(val)}
        </span>
      ),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 140, ellipsis: true },
    { title: '销售人员', dataIndex: 'salesPerson', key: 'salesPerson', width: 90 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
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
            description={`确定要删除「${record.id}」吗？`}
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
        title="出货单列表"
        description="管理出货单据，支持按交货日期、客户、品类筛选并导出 Excel"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          </Space>
        }
      />

      {/* 筛选区域 */}
      <div
        style={{
          background: '#fafafa',
          padding: '16px 16px 4px',
          marginBottom: 16,
          borderRadius: 8,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={7}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 90, flexShrink: 0 }}>交货日期：</span>
              <RangePicker
                value={dateRange as RangePickerProps['value']}
                onChange={(value) => setDateRange(value as [Dayjs, Dayjs] | null)}
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 90, flexShrink: 0 }}>客户名称：</span>
              <Input
                placeholder="请输入客户名称"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                allowClear
                onPressEnter={handleQuery}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 90, flexShrink: 0 }}>品类名称：</span>
              <Input
                placeholder="请输入品类名称"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                allowClear
                onPressEnter={handleQuery}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={4} lg={7}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table<Shipment>
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      {/* 新增 / 编辑弹窗（子组件，与父页面通过 props 通信） */}
      <ShipmentFormModal
        open={modalOpen}
        editingRecord={editingRecord}
        customers={mockCustomers}
        categories={mockCategories}
        generateId={generateId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default ShipmentsPage;
