import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { initIndustryChart, initIndustryStockChart } from '../utils/chartUtils';

interface IndustryHoldingsProps {
  industryHoldings: any[];
  selectedIndustry: string;
  setSelectedIndustry: (industry: string) => void;
  currentFundPage: number;
  setCurrentFundPage: (page: number) => void;
  stockHoldings: any[];
}

const IndustryHoldings: React.FC<IndustryHoldingsProps> = ({
  industryHoldings,
  selectedIndustry,
  setSelectedIndustry,
  currentFundPage,
  setCurrentFundPage,
  stockHoldings
}) => {
  const industryChartRef = useRef<HTMLDivElement>(null);
  const industryChartInstance = useRef<echarts.ECharts | null>(null);
  const industryStockChartRef = useRef<HTMLDivElement>(null);
  const industryStockChartInstance = useRef<echarts.ECharts | null>(null);

  // 获取选定行业的股票
  const getIndustryStocks = () => {
    if (!selectedIndustry) return [];
    
    return stockHoldings.filter(stock => 
      stock.industry === selectedIndustry
    ).sort((a, b) => b.totalRatio - a.totalRatio);
  };

  // 不分页，使用所有数据
  const industryStocks = getIndustryStocks();

  // 初始化和更新图表
  useEffect(() => {
    if (industryChartRef.current) {
      initIndustryChart(industryChartRef, industryChartInstance, industryHoldings);
    }

    if (industryStockChartRef.current) {
      initIndustryStockChart(industryStockChartRef, industryStockChartInstance, industryStocks);
    }
  }, [industryHoldings, industryStocks]);

  return (
    <div className="industry-holdings">
      <h2 className="mb-4">行业持仓统计</h2>
      
      {/* 行业选择器 */}
      <div className="mb-4">
        <select
          className="form-select"
          value={selectedIndustry}
          onChange={(e) => {
            setSelectedIndustry(e.target.value);
            setCurrentFundPage(1); // 切换行业时重置页码
          }}
        >
          <option value="">选择行业查看详情</option>
          {industryHoldings.map((industry, index) => (
            <option key={index} value={industry.name}>
              {industry.name}
            </option>
          ))}
        </select>
      </div>

      {/* 行业持仓图表 */}
      <div className="mb-6">
        <h3 className="mb-3">行业持仓比例</h3>
        <div ref={industryChartRef} style={{ width: '100%', height: 750 }}></div>
      </div>

      {/* 选定行业的股票列表 */}
      {selectedIndustry && (
        <>
          <h3 className="mb-3">{selectedIndustry} 行业股票持仓</h3>
          
          {/* 行业股票图表 */}
          <div className="mb-3">
            <div ref={industryStockChartRef} style={{ width: '100%', height: 5000 }}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default IndustryHoldings;