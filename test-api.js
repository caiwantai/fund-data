import { fetchFundData } from './src/api/api.ts';

async function testFetchFundData() {
  try {
    console.log('开始获取基金数据 (第1页，200条)...');
    const data = await fetchFundData();
    console.log('获取成功！');
    console.log('数据类型:', typeof data);
    console.log('总记录数:', data.record);
    console.log('总页数:', data.pages);
    console.log('当前页码:', data.curpage);
    console.log('数据条数:', data.datas ? data.datas.length : 0);
    console.log('数据结构:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function testFetchFundDataWithPagination() {
  try {
    console.log('开始获取基金数据 (第2页，50条)...');
    const data = await fetchFundData(2, 50);
    console.log('获取成功！');
    console.log('数据类型:', typeof data);
    console.log('总记录数:', data.record);
    console.log('总页数:', data.pages);
    console.log('当前页码:', data.curpage);
    console.log('数据条数:', data.datas ? data.datas.length : 0);
    console.log('数据结构:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testFetchFundData();
testFetchFundDataWithPagination();