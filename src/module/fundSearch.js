import { request } from '../utils/index.js';

/**
 * 基金搜索
 */
export default async (params) => {
  const url =
    'https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx';
  return request(url, params);
};
