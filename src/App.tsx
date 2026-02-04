import { useState, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import downloadFundData from './api/fundDataDown.js';
import downloadFundIncreaseData from './api/fundIncrease.js';
import { scanAvailableDates, scanAvailableFiles, readCsvFile, calculateStockHoldings, calculateFundIncreaseData, deleteFile } from './utils/dataProcessing';
import FileManager from './components/FileManager';
import FundIncreaseData from './components/FundIncreaseData';
import StockHoldings from './components/StockHoldings';
import IndustryHoldings from './components/IndustryHoldings';

function App() {
  // 文件管理相关状态
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [csvData, setCsvData] = useState<any[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('')
  
  // 股票持仓相关状态
  const [stockHoldings, setStockHoldings] = useState<any[]>([]);
  const [industryHoldings, setIndustryHoldings] = useState<any[]>([]);
  const [stockFundCounts, setStockFundCounts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentFundPage, setCurrentFundPage] = useState<number>(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [searchStock, setSearchStock] = useState<string>('');
  const [searchedStock, setSearchedStock] = useState<any>(null);
  
  // 下载状态
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  // 基金涨幅数据相关状态
  const [fundIncreaseData, setFundIncreaseData] = useState<any[]>([]);

  // 当选择日期变化时，扫描该日期的文件
  useEffect(() => {
    if (selectedDate) {
      scanAvailableFiles(selectedDate, setAvailableFiles, setSelectedFile);
    }
  }, [selectedDate]);

  // 当选择文件变化时，读取该文件
  useEffect(() => {
    if (selectedDate && selectedFile) {
      readCsvFile(selectedDate, selectedFile, setFileContent, setFileName, setError, setCsvData);
    }
  }, [selectedFile]);

  // 初始化时扫描可用日期
  useEffect(() => {
    scanAvailableDates(setAvailableDates, setSelectedDate);
    // 直接调用一次，确保即使没有日期目录也能初始化
    calculateStockHoldings(setStockHoldings, setIndustryHoldings, setStockFundCounts);
    // 加载基金涨幅数据
    calculateFundIncreaseData(setFundIncreaseData);
  }, []);

  // 下载数据后重新扫描
  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      // 下载基金持仓数据
      await downloadFundData();
      // 下载基金涨幅数据
      await downloadFundIncreaseData();
      // 刷新文件列表和数据
      setTimeout(() => {
        scanAvailableDates(setAvailableDates, setSelectedDate);
        calculateStockHoldings(setStockHoldings, setIndustryHoldings, setStockFundCounts);
        calculateFundIncreaseData(setFundIncreaseData);
        setIsDownloading(false);
      }, 1000);
    } catch (err) {
      setError(`下载失败: ${err instanceof Error ? err.message : String(err)}`);
      setIsDownloading(false);
    }
  };

  // 刷新文件列表
  const handleRefreshFiles = () => {
    scanAvailableDates(setAvailableDates, setSelectedDate);
    if (selectedDate) {
      scanAvailableFiles(selectedDate, setAvailableFiles, setSelectedFile);
    }
    // 重新计算所有数据
    calculateStockHoldings(setStockHoldings, setIndustryHoldings, setStockFundCounts);
    calculateFundIncreaseData(setFundIncreaseData);
  };

  // 删除选中的文件
  const handleDeleteFile = () => {
    if (!selectedDate || !selectedFile) return;

    if (window.confirm(`确定要删除文件 ${selectedFile} 吗？此操作不可恢复。`)) {
      try {
        deleteFile(selectedDate, selectedFile);
        // 更新文件列表
        scanAvailableFiles(selectedDate, setAvailableFiles, setSelectedFile);
        // 重新计算股票持仓
        calculateStockHoldings(setStockHoldings, setIndustryHoldings, setStockFundCounts);
        // 显示成功消息
        setError('');
      } catch (err) {
        console.error('删除文件失败:', err);
        setError(`删除文件失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  // 刷新基金涨幅数据
  const handleRefreshFundIncreaseData = () => {
    calculateFundIncreaseData(setFundIncreaseData);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-6 text-center">基金数据分析工具</h1>

      {/* 文件管理组件 */}
      <FileManager
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        availableFiles={availableFiles}
        selectedFile={selectedFile}
        onFileChange={setSelectedFile}
        fileContent={fileContent}
        fileName={fileName}
        csvData={csvData}
        error={error}
        onDownloadData={handleDownloadData}
        onRefreshFiles={handleRefreshFiles}
        onDeleteFile={handleDeleteFile}
        isDownloading={isDownloading}
      />

      <hr className="my-6" />

      {/* 基金涨幅数据组件 */}
      <FundIncreaseData
        fundIncreaseData={fundIncreaseData}
        onRefreshFundIncreaseData={handleRefreshFundIncreaseData}
        error={error}
      />

      <hr className="my-6" />

      {/* 股票持仓统计组件 */}
      <StockHoldings
        stockHoldings={stockHoldings}
        stockFundCounts={stockFundCounts}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentFundPage={currentFundPage}
        setCurrentFundPage={setCurrentFundPage}
        searchStock={searchStock}
        setSearchStock={setSearchStock}
        searchedStock={searchedStock}
        setSearchedStock={setSearchedStock}
      />

      <hr className="my-6" />

      {/* 行业持仓统计组件 */}
      <IndustryHoldings
        industryHoldings={industryHoldings}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        currentFundPage={currentFundPage}
        setCurrentFundPage={setCurrentFundPage}
        stockHoldings={stockHoldings}
      />
    </div>
  )
}

export default App