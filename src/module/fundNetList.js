import { request } from '../utils/index.js';

/**
 * 获取基金列表（按字母）
 */
export default async (params) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMApi/FundNetList.ashx';
  return request(url, params);
};
