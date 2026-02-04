import { request } from '../utils/index.js';

/**
 * 获取同类排名
 */
export default async (params) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMApi/FundRankDiagram.ashx';
  return request(url, params);
};
