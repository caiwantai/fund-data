import { request } from '../utils/index.js';

/**
 * 获取基金排行
 */
export default async (params = {}) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNRank';
  return request(url, params);
};
