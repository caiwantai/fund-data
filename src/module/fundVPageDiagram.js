import { post } from '../utils/index.js';

/**
 * 获取基金净值
 */
export default async (params = {}) => {
  const url =
    'https://fundcomapi.tiantianfunds.com/mm/newCore/FundVPageDiagram';
  return post(url, params);
};
