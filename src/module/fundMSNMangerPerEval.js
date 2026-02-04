import { post } from '../utils/index.js';

/**
 * 获取基金经理业绩评价
 */
export default async (params) => {
  const url =
    'https://fundztapi.eastmoney.com/FundSpecialApiNew/FundMSNMangerPerEval';
  return post(url, params);
};
