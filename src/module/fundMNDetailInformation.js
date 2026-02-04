import { request } from '../utils/index.js';

/**
 * 获取基金详情
 */
export default async (params) => {
  const url =
    'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNDetailInformation';
  return request(url, params);
};
