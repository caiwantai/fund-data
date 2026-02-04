import { request } from '../utils/index.js';

/**
 * 获取评级
 */
export default async (params) => {
  const url = 'https://fundmobapi.eastmoney.com/FundMApi/FundGradeDetail.ashx';
  return request(url, params);
};
