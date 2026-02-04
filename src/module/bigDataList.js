import { request } from '../utils/index.js';

/**
 * 获取大数据榜单
 */
export default async (params = {}) => {
  const url = 'https://appconfig2.1234567.com.cn/config/BigDataList';
  return request(url, params);
};
