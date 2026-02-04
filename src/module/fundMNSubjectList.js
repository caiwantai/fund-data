import { request } from '../utils/index.js';

/**
 * 获取基金主题列表（所有）
 */
export default async () => {
  const url = 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNSubjectList';
  return request(url);
};
