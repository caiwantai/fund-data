import { request } from '../utils/index.js';

/**
 * 获取热门主题
 */
export default async (params = {}) => {
  const url =
    'https://h5.1234567.com.cn/AggregationStaticService/getFundThemeListAggr';
  return request(url, params);
};
