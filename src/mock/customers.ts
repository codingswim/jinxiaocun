// 客户 - 模拟数据（供出货单表单下拉选择）
export interface Customer {
  id: number;
  name: string; // 客户名称
  contact: string; // 联系方式
}

export const mockCustomers: Customer[] = [
  { id: 1, name: '张三', contact: '13800000001' },
  { id: 2, name: '李四', contact: '13800000002' },
  { id: 3, name: '王五', contact: '13800000003' },
];
