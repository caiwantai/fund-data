// 基金涨幅数据下载
// 调用 fundMNNetNewList 接口获取 所有基金信息，通过基金FCODE，调用 fundMNPeriodIncrease 接口获取基金涨幅信息
// 写入 inc_out 目录 CSV格式文件

// fundMNPeriodIncrease 接口 返回在下面
// {
//   "Datas": [{
//     "title": "2021年度", // 具体周期 或者  Z 近一周  Y 近一月  3Y 近三月  6Y 近六月  1N 近1年  2N 近2年  3N 近3年  5N 近5年  JN 今年来  LN 成立来
//     "syl": "43.7292", // 涨跌幅%
//     "avg": "7.90", // 同类评价%
//     "hs300": "-5.1986",
//     "rank": "26", // 同类排行
//     "sc": "748", // 同类数量
//     "diff": null
//   }]
// }

import fs from 'fs';
import path from 'path';
import fundMNNetNewList from '../module/fundMNNetNewList.js';
import fundMNPeriodIncrease from '../module/fundMNPeriodIncrease.js';

// 周期代码到中文名称的映射
const PERIOD_MAPPING = {
    'Z': '近一周',
    'Y': '近一月',
    '3Y': '近三月',
    '6Y': '近六月',
    '1N': '近1年',
    '2N': '近2年',
    '3N': '近3年',
    '5N': '近5年',
    'JN': '今年来',
    'LN': '成立来'
};

// 周期顺序
const PERIOD_ORDER = ['Z', 'Y', '3Y', '6Y', '1N', '2N', '3N', '5N', 'JN', 'LN'];

// 配置对象
const CONFIG = {
    DEFAULT_FUND_TYPE: '0', // 股票型基金
    DEFAULT_PAGE_SIZE: 200, // 默认获取足够多的基金
    RETRY_DELAY: 1000, // 重试延迟(ms)
    MAX_RETRIES: 3, // 最大重试次数
    REQUEST_INTERVAL: 100, // 请求间隔(ms)
    OUTPUT_DIR: './inc_out', // 输出目录
    CONCURRENCY_LIMIT: 10 // 并发请求限制
};

// // 周期映射表
// const PERIOD_MAPPING = {
//     'Z': '近一周',
//     'Y': '近一月',
//     '3Y': '近三月',
//     '6Y': '近六月',
//     '1N': '近1年',
//     '2N': '近2年',
//     '3N': '近3年',
//     '5N': '近5年',
//     'JN': '今年来',
//     'LN': '成立来'
// };

// // 周期顺序
// const PERIOD_ORDER = ['Z', 'Y', '3Y', '6Y', '1N', '2N', '3N', '5N', 'JN', 'LN'];

// 创建输出目录
const createOutputDir = (date) => {
    const dateOutputDir = path.join(CONFIG.OUTPUT_DIR, date);
    if (!fs.existsSync(dateOutputDir)) {
        fs.mkdirSync(dateOutputDir, { recursive: true });
    }
    return dateOutputDir;
};

// 获取当前日期
const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 重试函数
 * @param {Function} fn - 要执行的函数
 * @param {number} retries - 重试次数
 * @param {number} delay - 重试延迟
 * @returns {Promise<any>} 函数执行结果
 */
async function retry(fn, retries = CONFIG.MAX_RETRIES, delay = CONFIG.RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.log(`操作失败，${delay}ms后重试，剩余次数: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, retries - 1, delay);
        }
        throw error;
    }
}

/**
 * 并发控制函数（信号量）
 * @param {number} limit - 并发限制
 * @returns {Object} 信号量控制对象
 */
function createSemaphore(limit) {
    const queue = [];
    let activeCount = 0;

    function runNext() {
        if (queue.length === 0 || activeCount >= limit) return;

        const { fn, resolve, reject } = queue.shift();
        activeCount++;

        Promise.resolve()
            .then(fn)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                activeCount--;
                runNext();
            });
    }

    return {
        async acquire(fn) {
            return new Promise((resolve, reject) => {
                queue.push({ fn, resolve, reject });
                runNext();
            });
        }
    };
}

// 创建信号量控制并发
const semaphore = createSemaphore(CONFIG.CONCURRENCY_LIMIT);

/**
 * 获取基金列表（单页）
 * @param {Object} params - 查询参数
 * @returns {Promise<Array>} 基金列表
 */
async function getFundList(params = {}) {
    try {
        const data = await retry(() => fundMNNetNewList({
            fundtype: params.fundtype || CONFIG.DEFAULT_FUND_TYPE,
            SortColumn: params.SortColumn || 'HLDWJZ',
            Sort: params.Sort || 'desc',
            pageIndex: params.pageIndex || 1,
            pagesize: params.pagesize || CONFIG.DEFAULT_PAGE_SIZE
        }));
        return data?.Datas ? data.Datas[0] : [];
    } catch (error) {
        console.error('获取基金列表失败:', error);
        return [];
    }
}

/**
 * 获取总页数
 * @returns {Promise<number>} 总页数
 */
async function getTotalPages() {
    const data = await retry(() => fundMNNetNewList({
        fundtype: CONFIG.DEFAULT_FUND_TYPE,
        pageIndex: 1,
        pagesize: CONFIG.DEFAULT_PAGE_SIZE
    }));
    console.log('获取总页数成功:', data.TotalCount);
    return Math.ceil(data.TotalCount / CONFIG.DEFAULT_PAGE_SIZE);
}

// 调用 fundMNPeriodIncrease 接口获取基金涨幅信息
const getFundIncrease = async (fundCode) => {
    return semaphore.acquire(async () => {
        try {
            const response = await retry(() => fundMNPeriodIncrease({
                FCODE: fundCode
            }));
            return response.Datas || [];
        } catch (error) {
            console.error(`获取基金${fundCode}涨幅信息失败:`, error);
            return [];
        }
    });
};

/**
 * 处理单页基金数据并写入文件
 * @param {string} filePath - 文件路径
 * @param {number} pageNum - 页码
 * @returns {Promise<void>}
 */
async function processFundPage(filePath, pageNum) {
    try {
        console.log(`开始处理第 ${pageNum} 页基金数据...`);
        
        // 获取基金列表
        const fundList = await getFundList({
            fundtype: CONFIG.DEFAULT_FUND_TYPE,
            pageIndex: pageNum,
            pagesize: CONFIG.DEFAULT_PAGE_SIZE
        });
        
        if (fundList.length === 0) {
            console.log(`第 ${pageNum} 页未获取到有效基金列表，处理结束`);
            return;
        }
        
        // 批量处理基金涨幅数据
        let content = '';
        let processedCount = 0;
        for (const fund of fundList) {
            const { FCODE, SHORTNAME } = fund;
            
            // 获取基金涨幅信息
            const increaseData = await getFundIncrease(FCODE);
            
            // 构建周期数据映射
            const periodData = {};
            for (const item of increaseData) {
                // 提取周期代码（从title中解析，如"Z 近一周"提取"Z"）
                const periodCode = item.title.split(' ')[0];
                periodData[periodCode] = item.syl;
            }
            
            // 按周期顺序构建一行数据
            const periodValues = PERIOD_ORDER.map(code => periodData[code] || '');
            content += [FCODE, SHORTNAME, ...periodValues].join('|') + '\n';
            
            processedCount++;
            if (processedCount % 100 === 0) {
                console.log(`第 ${pageNum} 页已处理 ${processedCount}/${fundList.length} 只基金`);
            }
            
            // 避免请求过快，添加延迟
            await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_INTERVAL));
        }
        
        // 写入文件
        if (content) {
            fs.appendFileSync(filePath, content);
        }
        
        console.log(`第 ${pageNum} 页基金数据处理完成，文件保存至: ${filePath}`);
    } catch (error) {
        console.error(`处理第 ${pageNum} 页基金数据失败:`, error);
    }
}

// 主函数
const downloadFundIncreaseData = async () => {
    console.log('开始下载基金涨幅数据...');
    
    try {
        // 获取总页数
        const totalPages = await getTotalPages();
        console.log(`共有 ${totalPages} 页数据`);
        
        // 清空输出目录
        if (fs.existsSync(CONFIG.OUTPUT_DIR)) {
            fs.rmSync(CONFIG.OUTPUT_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
        
        // 并行处理所有页面
        await Promise.all(
            Array.from({ length: totalPages }, async (_, i) => {
                const pageNum = i + 1;
                const filePath = path.join(CONFIG.OUTPUT_DIR, `${pageNum}-fund_increase.csv`);
                
                // 写入CSV表头
                const periodHeaders = PERIOD_ORDER.map(code => PERIOD_MAPPING[code]).join('|');
                const headers = `基金编码|基金名称|${periodHeaders}\n`;
                fs.writeFileSync(filePath, headers);
                
                // 处理页面数据
                await processFundPage(filePath, pageNum);
            })
        );
        
        console.log(`基金涨幅数据下载完成，文件保存至: ${CONFIG.OUTPUT_DIR}`);
        return CONFIG.OUTPUT_DIR;
    } catch (error) {
        console.error('下载基金涨幅数据失败:', error);
        throw error;
    }
};

export default downloadFundIncreaseData;

// 运行主函数
// downloadFundIncreaseData();