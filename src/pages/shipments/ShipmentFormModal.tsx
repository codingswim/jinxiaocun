import { useEffect, useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, DatePicker, Row, Col } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { formatMoney } from '@/utils';
import type { Shipment, Customer, Category } from '@/mock';

interface ShipmentFormModalProps {
  open: boolean;
  /** 正在编辑的记录；null 表示新增 */
  editingRecord: Shipment | null;
  /** 客户列表（内存数组） */
  customers: Customer[];
  /** 品类列表（品类管理维护的数据） */
  categories: Category[];
  /** 新增时由父组件生成的编号 */
  generateId: () => string;
  /** 提交回调：父组件据此新增/编辑并刷新列表 */
  onSubmit: (record: Shipment) => void;
  onCancel: () => void;
}

// 表单中可编辑字段的类型（计算字段不在此列，提交时另行计算）
type ShipmentFormValues = {
  customer: string;
  category: string;
  quantity: number;
  price: number;
  deliveryDate: Dayjs;
  paidAmount: number;
  salesPerson: string;
  remark: string;
};

function ShipmentFormModal({
  open,
  editingRecord,
  customers,
  categories,
  generateId,
  onSubmit,
  onCancel,
}: ShipmentFormModalProps) {
  const [form] = Form.useForm<ShipmentFormValues>();
  // 编号（只读）：新增时自动生成，编辑时回填
  const [formId, setFormId] = useState<string>('');

  const isEdit = editingRecord !== null;

  // 监听表单字段，用于联动计算
  const customerName = Form.useWatch('customer', form) as string | undefined;
  const quantity = (Form.useWatch('quantity', form) as number) ?? 0;
  const price = (Form.useWatch('price', form) as number) ?? 0;
  const paidAmount = (Form.useWatch('paidAmount', form) as number) ?? 0;

  // 联系方式：由客户带出（只读）
  const contact =
    customers.find((c) => c.name === customerName)?.contact ?? '';
  // 总金额 = 数量 × 单价（只读）
  const totalAmount = +(quantity * price).toFixed(2);
  // 未回货款 = 总金额 - 已回款（只读）
  const unpaidAmount = +(totalAmount - paidAmount).toFixed(2);

  // 弹窗打开时初始化表单
  useEffect(() => {
    if (!open) return;
    if (editingRecord) {
      form.setFieldsValue({
        customer: editingRecord.customer,
        category: editingRecord.category,
        quantity: editingRecord.quantity,
        price: editingRecord.price,
        deliveryDate: dayjs(editingRecord.deliveryDate),
        paidAmount: editingRecord.paidAmount,
        salesPerson: editingRecord.salesPerson,
        remark: editingRecord.remark,
      });
      setFormId(editingRecord.id);
    } else {
      form.resetFields();
      // 交货日期默认今天
      form.setFieldsValue({ deliveryDate: dayjs() });
      setFormId(generateId());
    }
    // 仅在弹窗打开/编辑目标变化时初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingRecord]);

  // 选择品类 → 带出该品类默认单价（单价仍可手动修改）
  const handleCategoryChange = (name: string) => {
    const cat = categories.find((c) => c.name === name);
    if (cat) {
      form.setFieldValue('price', cat.price);
    }
  };

  // 提交：校验 + 汇总计算字段
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const paid = values.paidAmount ?? 0;
      const total = +((values.quantity ?? 0) * (values.price ?? 0)).toFixed(2);
      const record: Shipment = {
        id: editingRecord?.id ?? formId,
        customer: values.customer,
        contact:
          customers.find((c) => c.name === values.customer)?.contact ?? '',
        category: values.category,
        quantity: values.quantity,
        price: values.price,
        totalAmount: total,
        deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
        paidAmount: paid,
        unpaidAmount: +(total - paid).toFixed(2),
        salesPerson: values.salesPerson,
        remark: values.remark ?? '',
      };
      onSubmit(record);
    } catch {
      // 校验失败，antd Form 自动显示字段错误
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑出货单' : '新增出货单'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      width={780}
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {/* 编号（只读，系统生成） */}
          <Col span={12}>
            <Form.Item label="编号" tooltip="系统自动生成，不可编辑">
              <Input value={formId} disabled placeholder="保存时自动生成" />
            </Form.Item>
          </Col>
          {/* 客户（下拉，必填） */}
          <Col span={12}>
            <Form.Item
              label="客户"
              name="customer"
              rules={[{ required: true, message: '请选择客户' }]}
            >
              <Select
                placeholder="请选择客户"
                options={customers.map((c) => ({ label: c.name, value: c.name }))}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* 联系方式（只读，由客户带出） */}
          <Col span={12}>
            <Form.Item label="联系方式" tooltip="选择客户后自动带出">
              <Input value={contact} disabled placeholder="选择客户后自动带出" />
            </Form.Item>
          </Col>
          {/* 品类（下拉，必填） */}
          <Col span={12}>
            <Form.Item
              label="品类"
              name="category"
              rules={[{ required: true, message: '请选择品类' }]}
            >
              <Select
                placeholder="请选择品类"
                options={categories.map((c) => ({ label: c.name, value: c.name }))}
                onChange={handleCategoryChange}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* 数量（必填） */}
          <Col span={12}>
            <Form.Item
              label="数量"
              name="quantity"
              rules={[
                { required: true, message: '请输入数量' },
                { type: 'number', min: 0, message: '数量不能小于 0' },
              ]}
            >
              <InputNumber
                placeholder="请输入数量"
                min={0}
                precision={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          {/* 单价（带出默认值，可修改） */}
          <Col span={12}>
            <Form.Item
              label="单价（元）"
              name="price"
              rules={[
                { required: true, message: '请输入单价' },
                { type: 'number', min: 0, message: '单价不能小于 0' },
              ]}
            >
              <InputNumber
                placeholder="请输入单价"
                min={0}
                precision={2}
                style={{ width: '100%' }}
                addonAfter="元"
              />
            </Form.Item>
          </Col>

          {/* 总金额（只读，自动计算） */}
          <Col span={12}>
            <Form.Item label="总金额（元）" tooltip="数量 × 单价，自动计算">
              <Input value={formatMoney(totalAmount)} disabled />
            </Form.Item>
          </Col>
          {/* 交货日期（默认今天，必填） */}
          <Col span={12}>
            <Form.Item
              label="交货日期"
              name="deliveryDate"
              rules={[{ required: true, message: '请选择交货日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择交货日期" />
            </Form.Item>
          </Col>

          {/* 已回款情况 */}
          <Col span={12}>
            <Form.Item
              label="已回款情况（元）"
              name="paidAmount"
              rules={[{ type: 'number', min: 0, message: '不能小于 0' }]}
            >
              <InputNumber
                placeholder="请输入已回款金额"
                min={0}
                precision={2}
                style={{ width: '100%' }}
                addonAfter="元"
              />
            </Form.Item>
          </Col>
          {/* 未回货款（只读，自动计算） */}
          <Col span={12}>
            <Form.Item label="未回货款（元）" tooltip="总金额 - 已回款，自动计算">
              <Input value={formatMoney(unpaidAmount)} disabled />
            </Form.Item>
          </Col>

          {/* 销售人员（必填） */}
          <Col span={12}>
            <Form.Item
              label="销售人员"
              name="salesPerson"
              rules={[{ required: true, message: '请输入销售人员' }]}
            >
              <Input placeholder="请输入销售人员" maxLength={20} />
            </Form.Item>
          </Col>
          {/* 备注（多行文本） */}
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea
                placeholder="请输入备注信息（选填）"
                maxLength={200}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default ShipmentFormModal;
