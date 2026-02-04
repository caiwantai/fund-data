import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { initChart, initFundCountChart } from '../utils/chartUtils';

interface StockHoldingsProps {
  stockHoldings: any[];
  stockFundCounts: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  currentFundPage: number;
  setCurrentFundPage: (page: number) => void;
  searchStock: string;
  setSearchStock: (search: string) => void;
  searchedStock: any | null;
  setSearchedStock: (stock: any | null) => void;
}

const StockHoldings: React.FC<StockHoldingsProps> = ({
  stockHoldings,
  stockFundCounts,
  currentPage,
  setCurrentPage,
  currentFundPage,
  setCurrentFundPage,
  searchStock,
  setSearchStock,
  searchedStock,
  setSearchedStock
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const fundCountChartRef = useRef<HTMLDivElement>(null);
  const fundCountChartInstance = useRef<echarts.ECharts | null>(null);

  // 搜索股票
  const handleSearchStock = () => {
    if (!searchStock) return;
    
    const stock = stockHoldings.find(item => 
      item.code === searchStock || 
      item.name === searchStock
    );
    
    if (stock) {
      // 计算股票在持仓比例图表中的页码并跳转
      const stockIndex = stockHoldings.findIndex(item => item.code === stock.code);
      if (stockIndex !== -1) {
        const pageSize = 50;
        const targetPage = Math.floor(stockIndex / pageSize) + 1;
        setCurrentPage(targetPage);
      }
      
      // 计算股票在基金持有数量图表中的页码并跳转
      const fundStockIndex = stockFundCounts.findIndex(item => item.code === stock.code);
      if (fundStockIndex !== -1) {
        const fundPageSize = 50;
        const targetFundPage = Math.floor(fundStockIndex / fundPageSize) + 1;
        setCurrentFundPage(targetFundPage);
      }
      
      // 计算排名
      const totalRatioRank = stockHoldings.length - stockIndex;
      let fundCountRank = null;
      if (fundStockIndex !== -1) {
        fundCountRank = stockFundCounts.length - fundStockIndex;
      }
      
      // 创建包含排名信息的股票对象
      const stockWithRanks = {
        ...stock,
        totalRatioRank,
        fundCountRank
      };
      
      setSearchedStock(stockWithRanks);
    } else {
      setSearchedStock(null);
    }
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchStock('');
    setSearchedStock(null);
  };

  // 分页控制
  const totalPages = Math.ceil(stockHoldings.length / 50);
  const pageSize = 50;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = stockHoldings.slice(startIndex, endIndex);

  // 基金持有数量分页控制
  const totalFundPages = Math.ceil(stockFundCounts.length / 50);
  const fundPageSize = 50;
  const fundStartIndex = (currentFundPage - 1) * fundPageSize;
  const fundEndIndex = fundStartIndex + fundPageSize;
  const paginatedFundData = stockFundCounts.slice(fundStartIndex, fundEndIndex);

  // 初始化和更新图表
  useEffect(() => {
    if (chartRef.current) {
      initChart(chartRef, chartInstance, paginatedData, stockHoldings, currentPage, searchedStock);
    }

    if (fundCountChartRef.current) {
          initFundCountChart(fundCountChartRef, fundCountChartInstance, paginatedFundData, stockFundCounts, currentFundPage, searchedStock);
        }
  }, [paginatedData, stockHoldings, currentPage, searchedStock, paginatedFundData, stockFundCounts, currentFundPage]);

  return (
    <div className="stock-holdings">
      <h2 className="mb-4">股票持仓统计</h2>
      
      {/* 搜索框 */}
      <div className="mb-4">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="输入股票代码或名称..."
            value={searchStock}
            onChange={(e) => setSearchStock(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={handleSearchStock}
          >
            搜索
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleClearSearch}
          >
            清空
          </button>
        </div>
      </div>

      {/* 搜索结果 */}
      {searchedStock && (
        <div className="alert alert-info mb-4" role="alert">
          搜索结果: {searchedStock.name} ({searchedStock.code}) - 总持仓占比: {searchedStock.totalRatio}% (排名: {searchedStock.totalRatioRank}) - 基金数量: {searchedStock.fundCount} (排名: {searchedStock.fundCountRank})
        </div>
      )}

      {/* 股票持仓图表（分页显示） */}
      <div className="mb-6">
        <h3 className="mb-3">股票持仓比例（第 {currentPage} 页）</h3>
        <div ref={chartRef} style={{ width: '100%', height: 2000 }}></div>
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <div className="d-flex align-items-center bg-light rounded px-3 py-2 border">
            <button 
              className="btn btn-sm mx-1 px-3" 
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              上一页
            </button>
            <span className="mx-2">
              第 
              <select 
                className="form-select form-select-sm d-inline-block w-auto mx-1" 
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
              页, 共 {totalPages} 页
            </span>
            <button 
              className="btn btn-sm mx-1 px-3" 
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 基金持有数量图表（分页显示） */}
      <div className="mt-8 mb-6">
        <h3 className="mb-3">基金持有股票数量（第 {currentFundPage} 页）</h3>
        <div ref={fundCountChartRef} style={{ width: '100%', height: 2000 }}></div>
      </div>

      {/* 基金持有数量分页控制 */}
      {totalFundPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <div className="d-flex align-items-center bg-light rounded px-3 py-2 border">
            <button 
              className="btn btn-sm mx-1 px-3" 
              onClick={() => setCurrentFundPage(Math.max(currentFundPage - 1, 1))}
              disabled={currentFundPage === 1}
              style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              上一页
            </button>
            <span className="mx-2">
              第 
              <select 
                className="form-select form-select-sm d-inline-block w-auto mx-1" 
                value={currentFundPage}
                onChange={(e) => setCurrentFundPage(parseInt(e.target.value))}
                style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                {Array.from({ length: totalFundPages }, (_, i) => i + 1).map(page => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
              页, 共 {totalFundPages} 页
            </span>
            <button 
              className="btn btn-sm mx-1 px-3" 
              onClick={() => setCurrentFundPage(Math.min(currentFundPage + 1, totalFundPages))}
              disabled={currentFundPage === totalFundPages}
              style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHoldings;