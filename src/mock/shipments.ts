// 出货管理 - 模拟数据
export interface Shipment {
  id: string; // 编号（PO + 年月日 + 序号）
  customer: string; // 客户
  contact: string; // 联系方式（由客户带出）
  category: string; // 品类
  quantity: number; // 数量
  price: number; // 单价
  totalAmount: number; // 总金额 = 数量 × 单价
  deliveryDate: string; // 交货日期 YYYY-MM-DD
  paidAmount: number; // 已回款情况
  unpaidAmount: number; // 未回货款 = 总金额 - 已回款情况
  salesPerson: string; // 销售人员
  remark: string; // 备注
}

// 工具：根据数量/单价/已回款生成一条出货单（自动计算总金额与未回货款）
const make = (
  partial: Omit<Shipment, 'totalAmount' | 'unpaidAmount'>,
): Shipment => {
  const totalAmount = +(partial.quantity * partial.price).toFixed(2);
  const unpaidAmount = +(totalAmount - partial.paidAmount).toFixed(2);
  return { ...partial, totalAmount, unpaidAmount };
};

export const mockShipments: Shipment[] = [
  make({
    id: 'PO20260810001',
    customer: '张三',
    contact: '13800000001',
    category: '矿泉水',
    quantity: 200,
    price: 2.0,
    deliveryDate: '2026-08-10',
    paidAmount: 400,
    salesPerson: '陈伟',
    remark: '现款现货',
  }),
  make({
    id: 'PO20260812001',
    customer: '李四',
    contact: '13800000002',
    category: '方便面',
    quantity: 100,
    price: 3.5,
    deliveryDate: '2026-08-12',
    paidAmount: 200,
    salesPerson: '刘洋',
    remark: '月结 30 天',
  }),
  make({
    id: 'PO20260815001',
    customer: '王五',
    contact: '13800000003',
    category: '抽纸',
    quantity: 50,
    price: 15.9,
    deliveryDate: '2026-08-15',
    paidAmount: 500,
    salesPerson: '陈伟',
    remark: '部分回款',
  }),
  make({
    id: 'PO20260818001',
    customer: '张三',
    contact: '13800000001',
    category: '可乐',
    quantity: 300,
    price: 2.5,
    deliveryDate: '2026-08-18',
    paidAmount: 750,
    salesPerson: '周磊',
    remark: '已结清',
  }),
  make({
    id: 'PO20260819001',
    customer: '李四',
    contact: '13800000002',
    category: '洗发水',
    quantity: 40,
    price: 39.9,
    deliveryDate: '2026-08-19',
    paidAmount: 800,
    salesPerson: '刘洋',
    remark: '尾款未付',
  }),
  make({
    id: 'PO20260820001',
    customer: '王五',
    contact: '13800000003',
    category: '矿泉水',
    quantity: 500,
    price: 2.0,
    deliveryDate: '2026-08-20',
    paidAmount: 0,
    salesPerson: '陈伟',
    remark: '待回款',
  }),
  make({
    id: 'PO20260821001',
    customer: '张三',
    contact: '13800000001',
    category: '抽纸',
    quantity: 100,
    price: 15.9,
    deliveryDate: '2026-08-21',
    paidAmount: 795,
    salesPerson: '周磊',
    remark: '分期回款',
  }),
];
