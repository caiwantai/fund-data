import fs from 'fs';
import path from 'path';

// 扫描可用的日期目录（适配新的目录结构）
export const scanAvailableDates = (
  setAvailableDates: (dates: string[]) => void,
  setSelectedDate: (date: string) => void
) => {
  try {
    const outputDir = path.join(process.cwd(), 'output');
    if (fs.existsSync(outputDir)) {
      // 检查是否存在文件（新结构）或子目录（旧结构）
      const items = fs.readdirSync(outputDir);
      const hasFiles = items.some(item => {
        const itemPath = path.join(outputDir, item);
        return fs.statSync(itemPath).isFile();
      });
      const hasDirs = items.some(item => {
        const itemPath = path.join(outputDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

      let dates: string[] = [];
      if (hasFiles) {
        // 新结构：直接有文件，使用固定日期标识
        dates = ['latest'];
      } else if (hasDirs) {
        // 旧结构：有子目录
        dates = items.filter(item => {
          const itemPath = path.join(outputDir, item);
          return fs.statSync(itemPath).isDirectory();
        });
      }

      setAvailableDates(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[dates.length - 1]); // 默认选择最新的
      }
    }
  } catch (err) {
    console.error('扫描日期目录失败:', err);
  }
};

// 扫描指定日期的可用文件（适配新的目录结构）
export const scanAvailableFiles = (
  date: string,
  setAvailableFiles: (files: string[]) => void,
  setSelectedFile: (file: string) => void
) => {
  try {
    let targetDir: string;
    if (date === 'latest') {
      // 新结构：直接使用输出目录
      targetDir = path.join(process.cwd(), 'output');
    } else {
      // 旧结构：使用日期子目录
      targetDir = path.join(process.cwd(), 'output', date);
    }

    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir)
        .filter(item => item.endsWith('.csv'));
      setAvailableFiles(files);
      if (files.length > 0) {
        setSelectedFile(files[0]); // 默认选择第一个文件
      }
    }
  } catch (err) {
    console.error('扫描文件失败:', err);
  }
};

// 读取并解析CSV文件（适配新的目录结构）
export const readCsvFile = (
  date: string,
  file: string,
  setFileContent: (content: string) => void,
  setFileName: (name: string) => void,
  setError: (error: string) => void,
  setCsvData: (data: any[]) => void
) => {
  try {
    let filePath: string;
    if (date === 'latest') {
      // 新结构：直接从输出目录读取
      filePath = path.join(process.cwd(), 'output', file);
    } else {
      // 旧结构：从日期子目录读取
      filePath = path.join(process.cwd(), 'output', date, file);
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      setFileContent(content);
      setFileName(file);
      setError('');
      
      // 解析CSV数据
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split('|');
        const data = lines.slice(1).map(line => {
          const values = line.split('|');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        setCsvData(data);
      } else {
        setCsvData([]);
      }
    } else {
      setError('文件不存在，请先下载基金数据');
      setFileContent('');
      setFileName('');
      setCsvData([]);
    }
  } catch (err) {
    setError(`读取文件失败: ${err instanceof Error ? err.message : String(err)}`);
    setFileContent('');
    setFileName('');
    setCsvData([]);
  }
};

// 统计所有文件中的股票持仓比例
export const calculateStockHoldings = (
  setStockHoldings: (holdings: any[]) => void,
  setIndustryHoldings: (holdings: any[]) => void,
  setStockFundCounts: (counts: any[]) => void
) => {
  try {
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      setStockHoldings([]);
      setIndustryHoldings([]);
      setStockFundCounts([]);
      return;
    }

    const stockMap = new Map<string, { name: string, code: string, industry: string, industryCode: string, totalRatio: number, fundCount: number, funds: Set<string> }>();
    const industryMap = new Map<string, { name: string, code: string, totalRatio: number, fundCount: number, funds: Set<string> }>();

    // 检查是否存在直接的CSV文件（新结构）
    const filesInRoot = fs.readdirSync(outputDir).filter(item => item.endsWith('.csv'));
    
    if (filesInRoot.length > 0) {
      // 新结构：直接读取输出目录中的所有CSV文件
      filesInRoot.forEach(file => {
        processFile(path.join(outputDir, file), stockMap, industryMap);
      });
    } else {
      // 旧结构：遍历所有日期目录
      const dates = fs.readdirSync(outputDir).filter(item => {
        const itemPath = path.join(outputDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

      // 遍历每个日期目录下的所有文件
      dates.forEach(date => {
        const dateDir = path.join(outputDir, date);
        if (fs.existsSync(dateDir)) {
          const files = fs.readdirSync(dateDir).filter(item => item.endsWith('.csv'));
          
          files.forEach(file => {
            processFile(path.join(dateDir, file), stockMap, industryMap);
          });
        }
      });
    }

    // 转换为数组并排序
    const stockData = Array.from(stockMap.values())
      .sort((a, b) => b.totalRatio - a.totalRatio);
    
    const industryData = Array.from(industryMap.values())
      .sort((a, b) => b.totalRatio - a.totalRatio);
    
    const stockFundCountData = Array.from(stockMap.values())
      .sort((a, b) => b.fundCount - a.fundCount);

    setStockHoldings(stockData);
    setIndustryHoldings(industryData);
    setStockFundCounts(stockFundCountData);
  } catch (err) {
    console.error('统计股票持仓失败:', err);
    setStockHoldings([]);
    setIndustryHoldings([]);
    setStockFundCounts([]);
  }
};

// 处理单个文件的辅助函数
const processFile = (filePath: string, stockMap: Map<string, any>, industryMap: Map<string, any>) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length > 0) {
      const headers = lines[0].split('|');
      const data = lines.slice(1).map(line => {
        const values = line.split('|');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // 处理每条数据
      data.forEach(row => {
        const stockCode = row['持仓股票代码'];
        const stockName = row['持仓股票名字'];
        const industry = row['股票行业'];
        const industryCode = row['股票行业代码'];
        const ratio = parseFloat(row['股票持仓占比']) || 0;
        const fundCode = row['基金编码'];

        if (stockCode && stockName && ratio > 0) {
          // 股票数据聚合
          if (stockMap.has(stockCode)) {
            const existing = stockMap.get(stockCode)!;
            existing.totalRatio += ratio;
            existing.totalRatio = parseFloat(existing.totalRatio.toFixed(4)); // 保留4位小数
            if (fundCode) {
              existing.funds.add(fundCode);
              existing.fundCount = existing.funds.size;
            }
          } else {
            const funds = new Set<string>();
            if (fundCode) {
              funds.add(fundCode);
            }
            stockMap.set(stockCode, {
              name: stockName,
              code: stockCode,
              industry: industry,
              industryCode: industryCode,
              totalRatio: parseFloat(ratio.toFixed(4)), // 保留4位小数
              fundCount: funds.size,
              funds: funds
            });
          }

          // 行业数据聚合
          if (industry) {
            const industryKey = industryCode ? `${industryCode}-${industry}` : industry;
            if (industryMap.has(industryKey)) {
              const existing = industryMap.get(industryKey)!;
              existing.totalRatio += ratio;
              existing.totalRatio = parseFloat(existing.totalRatio.toFixed(4)); // 保留4位小数
              if (fundCode) {
                existing.funds.add(fundCode);
                existing.fundCount = existing.funds.size;
              }
            } else {
              const funds = new Set<string>();
              if (fundCode) {
                funds.add(fundCode);
              }
              industryMap.set(industryKey, {
                name: industry,
                code: industryCode || '',
                totalRatio: parseFloat(ratio.toFixed(4)), // 保留4位小数
                fundCount: funds.size,
                funds: funds
              });
            }
          }
        }
      });
    }
  } catch (err) {
    console.error(`读取文件失败 ${filePath}:`, err);
  }
};

// 读取所有基金涨幅 CSV 文件
export const calculateFundIncreaseData = (
  setFundIncreaseData: (data: any[]) => void
) => {
  try {
    const outputDir = path.join(process.cwd(), 'inc_out');
    if (!fs.existsSync(outputDir)) {
      setFundIncreaseData([]);
      return;
    }

    const fundMap = new Map<string, any>();

    // 检查是否存在直接的CSV文件（新结构）
    const filesInRoot = fs.readdirSync(outputDir).filter(item => item.endsWith('.csv'));
    
    if (filesInRoot.length > 0) {
      // 新结构：直接读取 inc_out 目录中的所有CSV文件
      filesInRoot.forEach(file => {
        processFundIncreaseFile(path.join(outputDir, file), fundMap);
      });
    } else {
      // 旧结构：遍历所有日期目录
      const dates = fs.readdirSync(outputDir).filter(item => {
        const itemPath = path.join(outputDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

      // 遍历每个日期目录下的所有文件
      dates.forEach(date => {
        const dateDir = path.join(outputDir, date);
        if (fs.existsSync(dateDir)) {
          const files = fs.readdirSync(dateDir).filter(item => item.endsWith('.csv'));
          
          files.forEach(file => {
            processFundIncreaseFile(path.join(dateDir, file), fundMap);
          });
        }
      });
    }

    // 转换为数组
    const fundData = Array.from(fundMap.values());
    setFundIncreaseData(fundData);
  } catch (err) {
    console.error('统计基金涨幅数据失败:', err);
    setFundIncreaseData([]);
  }
};

// 处理单个基金涨幅文件的辅助函数
const processFundIncreaseFile = (filePath: string, fundMap: Map<string, any>) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length > 0) {
      const headers = lines[0].split('|');
      const data = lines.slice(1).map(line => {
        const values = line.split('|');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // 处理每条数据
      data.forEach(row => {
        const fundCode = row['基金编码'];
        if (fundCode) {
          fundMap.set(fundCode, row);
        }
      });
    }
  } catch (err) {
    console.error(`读取基金涨幅文件失败 ${filePath}:`, err);
  }
};

// 删除文件
export const deleteFile = (date: string, file: string) => {
  let filePath: string;
  if (date === 'latest') {
    // 新结构：直接从输出目录删除
    filePath = path.join(process.cwd(), 'output', file);
  } else {
    // 旧结构：从日期子目录删除
    filePath = path.join(process.cwd(), 'output', date, file);
  }
  fs.unlinkSync(filePath);
  console.log(`文件已删除: ${filePath}`);
};