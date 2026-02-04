import { post } from '../utils/index.js';

/**
 * 获取基金累计收益
 */
export default async (params = {}) => {
  const url = 'https://fundcomapi.tiantianfunds.com/mm/newCore/FundVPageAcc';
  return post(url, params);
};
