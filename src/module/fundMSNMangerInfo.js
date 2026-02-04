import { post } from '../utils/index.js';

/**
 * 获取基金经理信息
 */
export default async (params) => {
  const url =
    'https://fundztapi.eastmoney.com/FundSpecialApiNew/FundMSNMangerInfo';
  return post(url, params);
};
