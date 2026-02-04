import { request } from '../utils/index.js';

/**
 * 获取基金排行(香港)
 */
export default async (params = {}) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNHKRank';
  return request(url, params);
};
