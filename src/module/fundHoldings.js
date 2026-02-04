import { post } from '../utils/index.js';

/**
 * 获取基金持仓
 * @param {Object} params - 参数
 * @param {string} params.fcode - 基金代码
 * @returns {Promise} - 返回基金持仓数据
 */
export default async (params = {}) => {
  const { fcode } = params;
  if (!fcode) {
    throw new Error('基金代码 fcode 不能为空');
  }

  const url = 'https://dgs.tiantianfunds.com/merge/m/api/jjxqy2';
  return post(url, params);
};