import { request } from '../utils/index.js';

/**
 * 获取年度涨幅
 */
export default async (params) => {
  const url =
    'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNPeriodIncrease';
  return request(url, params);
};
