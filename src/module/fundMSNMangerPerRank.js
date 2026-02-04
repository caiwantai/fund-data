import { post } from '../utils/index.js';

/**
 * 获取基金经理业绩排行
 */
export default async (params) => {
  const url =
    'https://fundztapi.eastmoney.com/FundSpecialApiNew/FundMSNMangerPerRank';
  return post(url, params);
};
