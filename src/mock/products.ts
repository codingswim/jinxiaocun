// 品类管理 - 模拟数据
export interface Category {
  id: number;
  name: string; // 品类名称
  spec: string; // 规格型号
  unit: string; // 单位
  price: number; // 默认单价（元）
  image: string; // 图片地址
}

// 图片统一由 text_to_image 接口生成，避免外链失效
const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=square_hd`;

export const mockCategories: Category[] = [
  {
    id: 1,
    name: '矿泉水',
    spec: '550ml',
    unit: '瓶',
    price: 2.0,
    image: img('mineral water bottle product photo white background'),
  },
  {
    id: 2,
    name: '方便面',
    spec: '红烧牛肉味 105g',
    unit: '包',
    price: 3.5,
    image: img('instant noodles cup product photo white background'),
  },
  {
    id: 3,
    name: '抽纸',
    spec: '10包装',
    unit: '提',
    price: 15.9,
    image: img('facial tissue box product photo white background'),
  },
  {
    id: 4,
    name: '可乐',
    spec: '330ml',
    unit: '罐',
    price: 2.5,
    image: img('red cola can product photo white background'),
  },
  {
    id: 5,
    name: '洗发水',
    spec: '500ml',
    unit: '瓶',
    price: 39.9,
    image: img('shampoo bottle product photo white background'),
  },
];
