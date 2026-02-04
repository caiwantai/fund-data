import { request } from '../utils/index.js';

/**
 * 获取基金列表（按类型）
 */
export default async (params) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNNetNewList';
  return request(url, params);
};
