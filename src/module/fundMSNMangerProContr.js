import { post } from '../utils/index.js';

/**
 * 获取基金经理历史管理基金
 */
export default async (params) => {
  const url =
    'https://fundztapi.eastmoney.com/FundSpecialApiNew/FundMSNMangerProContr';
  return post(url, params);
};
