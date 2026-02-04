import { request } from '../utils/index.js';

/**
 * 获取基金的基金经理
 */
export default async (params) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNMangerList';
  return request(url, params);
};
