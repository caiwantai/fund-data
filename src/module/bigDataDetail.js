import { request } from '../utils/index.js';

/**
 * 获取大数据榜单数据详情
 */
export default async (params = {}) => {
  const url = 'https://appconfig2.1234567.com.cn/config/BigDatadetail';
  return request(url, params);
};
