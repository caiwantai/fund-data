import { post } from '../utils/index.js';

/**
 * 获取基金经理持仓特点
 */
export default async (params) => {
  const url =
    'https://fundztapi.eastmoney.com/FundSpecialApiNew/FundMSNMangerPosChar';
  return post(url, params);
};
