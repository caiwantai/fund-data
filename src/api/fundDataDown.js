import fundMNNetNewList from '../module/fundMNNetNewList.js';
import fundHoldings from '../module/fundHoldings.js';
import * as fs from "node:fs";
import path from "node:path";
// const fs = window.require('fs')
// const path =window. require('path')

// 配置对象
const CONFIG = {
    DEFAULT_FUND_TYPE: '0', // 股票型基金
    DEFAULT_PAGE_SIZE: 200, // 默认获取50只基金
    BATCH_SIZE: 5, // 批处理大小
    RETRY_DELAY: 1000, // 重试延迟(ms)
    MAX_RETRIES: 3, // 最大重试次数
    REQUEST_INTERVAL: 10, // 请求间隔(ms)
    OUTPUT_DIR: './output', // 输出目录
    CONCURRENCY_LIMIT: 10 // 并发请求限制
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
 * 获取基金列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Array>} 基金列表
 */
async function getFundList(params = {}) {
    try {
        console.log('正在获取基金列表...');
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
 * 获取基金持仓数据
 * @param {string} fundId - 基金代码
 * @returns {Promise<Object>} 持仓数据
 * [
 *   {
 *     "PCTNVCHG": "1.17",
 *     "INDEXCODE": "029004",
 *     "GPDM": "600988",
 *     "GPJC": "赤峰黄金",
 *     "NEWTEXCH": "1",
 *     "HOLDCOUNT": "3.0",
 *     "PCTNVCHGTYPE": "增持",
 *     "JZBL": "7.93",
 *     "INDEXNAME": "有色金属",
 *     "ISINVISBL": "0"
 *   }
 * ]
 */
async function getFundStockHoldings(fundId) {
    return semaphore.acquire(async () => {
        try {
            const data = await retry(() => fundHoldings({fcode: fundId}));
            return data?.data?.fundInverstPosition?.fundStocks || []
        } catch (error) {
            console.error(`获取基金 ${fundId} 持仓失败:`, error);
            return [];
        }
    });
}

async function getPageData(filePath, i) {
    try {
        console.log(`开始获取第${i}页...`);

        // 获取基金列表
        const fundList = await getFundList({
            fundtype: CONFIG.DEFAULT_FUND_TYPE,
            pageIndex: i,
            pagesize: CONFIG.DEFAULT_PAGE_SIZE
        });

        if (fundList.length === 0) {
            console.log('未获取到有效基金列表，分析结束');
            return;
        }

        // 并行处理基金持仓数据
        const allHoldingsData = await Promise.all(
            fundList.map(async (fund) => {
                const holdListObj = await getFundStockHoldings(fund.FCODE);
                return {
                    fund,
                    holdings: holdListObj || []
                };
            })
        );

        // 批量写入文件，减少 I/O 操作
        let content = '';
        for (const { fund, holdings } of allHoldingsData) {
            for (const holding of holdings) {
                const { GPDM, GPJC, JZBL,INDEXCODE, INDEXNAME } = holding;
                content += [fund.FCODE, fund.SHORTNAME, GPDM, GPJC, JZBL, INDEXCODE, INDEXNAME].join('|') + '\n';
            }
        }
        if (content) {
            fs.appendFileSync(filePath, content);
        }

        console.log(`结束获取第${i}页...`);
    } catch (error) {
        console.error('分析过程中发生错误:', error);
    }
}

/**
 * 主函数
 */
async function downloadFundData() {
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
            const filePath = path.join(CONFIG.OUTPUT_DIR, `${pageNum}-output.csv`);
            // 写入表头
            fs.writeFileSync(filePath, '基金编码|基金名字|持仓股票代码|持仓股票名字|股票持仓占比|股票行业代码|股票行业\n');
            await getPageData(filePath, pageNum);
        })
    );

    console.log('所有页面数据获取完成！' + CONFIG.OUTPUT_DIR);
}

async function getTotalPages() {
    const data = await fundMNNetNewList({
        fundtype: CONFIG.DEFAULT_FUND_TYPE,
        pageIndex: 1,
        pagesize: 2
    });
    console.log('获取总页数成功:', data.TotalCount);
    return Math.ceil(data.TotalCount / CONFIG.DEFAULT_PAGE_SIZE);
}
export default downloadFundData;
// 运行主函数
// downloadFundData();