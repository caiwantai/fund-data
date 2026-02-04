import { request } from '../utils/index.js';

/**
 * 以基金名称搜索
 */
export default async (params) => {
  const url = 'https://fundts.eastmoney.com/search/s/fundinfobynohigh';
  return request(url, params);
};
