import React, { useState } from 'react';
import fundHoldings from '../module/fundHoldings.js';

interface FundIncreaseDataProps {
  fundIncreaseData: any[];
  onRefreshFundIncreaseData: () => void;
  error: string;
}

const FundIncreaseData: React.FC<FundIncreaseDataProps> = ({
  fundIncreaseData,
  onRefreshFundIncreaseData,
  error
}) => {
  const [currentFundIncreasePage, setCurrentFundIncreasePage] = useState<number>(1);
  const [fundIncreaseSortField, setFundIncreaseSortField] = useState<string>('');
  const [fundIncreaseSortOrder, setFundIncreaseSortOrder] = useState<'asc' | 'desc'>('desc');
  const [fundIncreaseSearch, setFundIncreaseSearch] = useState<string>('');
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [fundHoldingsData, setFundHoldingsData] = useState<any>(null);
  const [isHoldingsModalOpen, setIsHoldingsModalOpen] = useState<boolean>(false);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState<boolean>(false);

  // 处理基金涨幅数据排序
  const handleFundIncreaseSort = (field: string) => {
    setFundIncreaseSortField(field);
    setFundIncreaseSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // 获取基金持仓数据
  const getFundHoldingsData = async (fundCode: string) => {
    try {
      setIsLoadingHoldings(true);
      const data = await fundHoldings({ fcode: fundCode });
      const fundStocks = data?.data?.fundInverstPosition?.fundStocks
        || data?.data?.fundInverstPosition?.fundboods || [];

      setFundHoldingsData(fundStocks);
      setIsHoldingsModalOpen(true);
    } catch (error) {
      console.error('获取基金持仓数据失败:', error);
    } finally {
      setIsLoadingHoldings(false);
    }
  };

  // 处理基金行点击事件
  const handleFundRowClick = (fund: any) => {
    setSelectedFund(fund);
    getFundHoldingsData(fund['基金编码']);
  };

  // 获取排序和搜索后的基金涨幅数据
  const getSortedFundIncreaseData = () => {
    let filteredData = [...fundIncreaseData];

    // 应用搜索过滤
    if (fundIncreaseSearch) {
      const searchTerm = fundIncreaseSearch.toLowerCase();
      filteredData = filteredData.filter(fund =>
        fund['基金编码'].toLowerCase().includes(searchTerm) ||
        fund['基金名称'].toLowerCase().includes(searchTerm)
      );
    }

    // 应用排序
    if (fundIncreaseSortField) {
      filteredData.sort((a, b) => {
        const valueA = parseFloat(a[fundIncreaseSortField]) || 0;
        const valueB = parseFloat(b[fundIncreaseSortField]) || 0;

        if (fundIncreaseSortOrder === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }

    return filteredData;
  };

  // 获取分页后的基金涨幅数据
  const getPaginatedFundIncreaseData = () => {
    const sortedData = getSortedFundIncreaseData();
    const pageSize = 100;
    const startIndex = (currentFundIncreasePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  };

  // 分页控制
  const totalPages = Math.ceil(getSortedFundIncreaseData().length / 100);
  const paginatedData = getPaginatedFundIncreaseData();

  return (
    <div className="fund-increase-data">
      <h2 className="mb-4">基金涨幅数据统计</h2>

      {/* 搜索框 */}
      <div className="mb-4">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="搜索基金编码或名称..."
            value={fundIncreaseSearch}
            onChange={(e) => setFundIncreaseSearch(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setFundIncreaseSearch('')}
          >
            清空
          </button>
        </div>
      </div>

      {/* 错误消息 */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      {/* 基金涨幅数据表格 */}
      <div className="table-responsive" style={{ maxHeight: '800px' }}>
        <table className="table table-striped table-hover table-sm">
          <thead className="table-light sticky-top">
            <tr>
              <th>基金编码</th>
              <th>基金名称</th>
              <th>日涨跌幅</th>
              <th
                onClick={() => handleFundIncreaseSort('近一周')}
                style={{ cursor: 'pointer' }}
              >
                周涨跌幅 {fundIncreaseSortField === '近一周' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近一月')}
                style={{ cursor: 'pointer' }}
              >
                月涨跌幅 {fundIncreaseSortField === '近一月' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近三月')}
                style={{ cursor: 'pointer' }}
              >
                季涨跌幅 {fundIncreaseSortField === '近三月' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近六月')}
                style={{ cursor: 'pointer' }}
              >
                近六月 {fundIncreaseSortField === '近六月' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近1年')}
                style={{ cursor: 'pointer' }}
              >
                年涨跌幅 {fundIncreaseSortField === '近1年' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近2年')}
                style={{ cursor: 'pointer' }}
              >
                近2年 {fundIncreaseSortField === '近2年' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近3年')}
                style={{ cursor: 'pointer' }}
              >
                近3年 {fundIncreaseSortField === '近3年' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('近5年')}
                style={{ cursor: 'pointer' }}
              >
                近5年 {fundIncreaseSortField === '近5年' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('今年来')}
                style={{ cursor: 'pointer' }}
              >
                今年来 {fundIncreaseSortField === '今年来' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                onClick={() => handleFundIncreaseSort('成立来')}
                style={{ cursor: 'pointer' }}
              >
                成立来 {fundIncreaseSortField === '成立来' && (
                  <span>{fundIncreaseSortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((fund, index) => (
                <tr
                  key={index}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleFundRowClick(fund)}
                >
                  <td>{fund['基金编码']}</td>
                  <td>{fund['基金名称']}</td>
                  <td></td>
                  <td>{fund['近一周']}</td>
                  <td>{fund['近一月']}</td>
                  <td>{fund['近三月']}</td>
                  <td>{fund['近六月']}</td>
                  <td>{fund['近1年']}</td>
                  <td>{fund['近2年']}</td>
                  <td>{fund['近3年']}</td>
                  <td>{fund['近5年']}</td>
                  <td>{fund['今年来']}</td>
                  <td>{fund['成立来']}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center">暂无基金涨幅数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <div className="d-flex align-items-center bg-light rounded px-3 py-2 border">
            <button 
              className="btn btn-sm mx-1 px-3" 
              onClick={() => setCurrentFundIncreasePage(Math.max(currentFundIncreasePage - 1, 1))}
              disabled={currentFundIncreasePage === 1}
              style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              上一页
            </button>
            <span className="mx-2">
              第 
              <select 
                className="form-select form-select-sm d-inline-block w-auto mx-1" 
                value={currentFundIncreasePage}
                onChange={(e) => setCurrentFundIncreasePage(parseInt(e.target.value))}
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
              onClick={() => setCurrentFundIncreasePage(Math.min(currentFundIncreasePage + 1, totalPages))}
              disabled={currentFundIncreasePage === totalPages}
              style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 基金持仓模态框 */}
      {isHoldingsModalOpen && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedFund?.['基金名称']} ({selectedFund?.['基金编码']}) 持仓明细
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsHoldingsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {isLoadingHoldings ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">加载中...</p>
                  </div>
                ) : fundHoldingsData && fundHoldingsData.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: '400px' }}>
                    <table className="table table-striped table-hover table-sm">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>持仓股票代码</th>
                          <th>持仓股票名字</th>
                          <th>股票持仓占比</th>
                          <th>股票行业</th>
                          <th>股票行业代码</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fundHoldingsData.map((item: any, index: number) => (
                          <tr key={index}>
                            <td >{item.GPDM || ''}</td>
                            <td >{item.GPJC || ''}</td>
                            <td >{item.JZBL || ''}</td>
                            <td >{item.INDEXNAME || ''}</td>
                            <td >{item.INDEXCODE || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center">暂无持仓数据</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsHoldingsModalOpen(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundIncreaseData;