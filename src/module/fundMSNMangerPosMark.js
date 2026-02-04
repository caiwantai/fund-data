import { post } from '../utils/index.js';

/**
 * 获取基金经理风格
 */
export default async (params) => {
  const url =
    'https://fundztapi.eastmoney.com/FundSpecialApiNew/FundMSNMangerPosMark';
  return post(url, params);
};
