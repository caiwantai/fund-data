import { request } from '../utils/index.js';

/**
 * 获取主题焦点列表
 */
export default async (params = {}) => {
  const url =
    'https://h5.1234567.com.cn/AggregationStaticService/chooseCustomRouter/getFundThemeFocusAggr';
  return request(url, params);
};
