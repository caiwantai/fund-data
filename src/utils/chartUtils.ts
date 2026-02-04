import * as echarts from 'echarts';

// 初始化股票持仓图表
export const initChart = (
  chartRef: React.RefObject<HTMLDivElement>,
  chartInstance: React.RefObject<echarts.ECharts | null>,
  paginatedData: any[],
  _stockHoldings: any[],
  _currentPage: number,
  searchedStock: any | null
) => {
  if (!chartRef.current) return;

  // 销毁旧实例
  if (chartInstance.current) {
    chartInstance.current.dispose();
  }

  // 初始化新实例
  const container = chartRef.current;
  const instance = echarts.init(container);
  
  // 更新 chartInstance ref
  // chartInstance.current = instance;

  // 使用分页数据
  const displayData = paginatedData;
  // 反转数据，使最大的在顶部
  const reversedData = [...displayData].reverse();

  // 准备图表数据
  const data = reversedData.map(item => ({
    name: item.name,
    value: item.totalRatio
  }));

  // 图表配置
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const item = params[0];
        const stock = reversedData[params[0].dataIndex];
        return `${item.name}<br/>持仓占比: ${item.value}%<br/>股票代码: ${stock.code}<br/>所属行业: ${stock.industry}<br/>基金数量: ${stock.fundCount}`;
      }
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '持仓占比(%)'
    },
    yAxis: {
      type: 'category',
      data: reversedData.map(item => `${item.name} (${item.code})`),
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 15
      }
    },
    series: [
      {
        name: '持仓占比',
        type: 'bar',
        data: data,
        barWidth: '70%',
        itemStyle: {
          color: function(params: any) {
            const stock = reversedData[params.dataIndex];
            return stock.code === searchedStock?.code ? '#f40606ff' : '#d48265';
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          fontSize: 15
        }
      }
    ]
  };

  // 设置配置并渲染
  instance.setOption(option);

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    instance.resize();
  });
};

// 初始化行业持仓图表
export const initIndustryChart = (
  chartRef: React.RefObject<HTMLDivElement>,
  chartInstance: React.RefObject<echarts.ECharts | null>,
  industryHoldings: any[]
) => {
  if (!chartRef.current) return;

  // 销毁旧实例
  if (chartInstance.current) {
    chartInstance.current.dispose();
  }

  // 初始化新实例
  const container = chartRef.current;
  const instance = echarts.init(container);

  // 准备图表数据
  const data = industryHoldings.map(item => ({
    name: item.name,
    value: item.totalRatio,
    fundCount: item.fundCount || 0
  }));

  // 图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const item = params;
        return `${item.name}<br/>持仓占比: ${item.value}% (${item.percent}%)<br/>基金数量: ${item.data.fundCount}只`;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: industryHoldings.map(item => item.name)
    },
    series: [
      {
        name: '行业持仓',
        type: 'pie',
        radius: '100%',
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c}%'
        }
      }
    ]
  };

  // 设置配置并渲染
  instance.setOption(option);

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    instance.resize();
  });
};

// 初始化行业股票图表
export const initIndustryStockChart = (
  chartRef: React.RefObject<HTMLDivElement>,
  chartInstance: React.RefObject<echarts.ECharts | null>,
  industryStocks: any[]
) => {
  if (!chartRef.current) return;

  // 销毁旧实例
  if (chartInstance.current) {
    chartInstance.current.dispose();
  }

  // 初始化新实例
  const container = chartRef.current;
  const instance = echarts.init(container);

  // 使用所有数据
  const displayData = industryStocks;
  // 反转数据，使最大的在顶部
  const reversedData = [...displayData].reverse();

  // 准备图表数据
  const data = reversedData.map(item => ({
    name: item.name,
    value: item.totalRatio
  }));

  // 图表配置（参考基金持有股票数量图的样式）
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const item = params[0];
        const stock = reversedData[params[0].dataIndex];
        return `${item.name}<br/>持仓占比: ${item.value}%<br/>股票代码: ${stock.code}<br/>基金数量: ${stock.fundCount}只`;
      }
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '持仓占比(%)'
    },
    yAxis: {
      type: 'category',
      data: reversedData.map(item => `${item.name} (${item.code})`),
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 15
      }
    },
    series: [
      {
        name: '持仓占比',
        type: 'bar',
        data: data,
        barWidth: '70%',
        itemStyle: {
          color: function(params: any) {
            return '#54af61ff';
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          fontSize: 15
        }
      }
    ]
  };

  // 设置配置并渲染
  instance.setOption(option);

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    instance.resize();
  });
};

// 初始化基金持有数量图表
export const initFundCountChart = (
  chartRef: React.RefObject<HTMLDivElement>,
  chartInstance: React.RefObject<echarts.ECharts | null>,
  paginatedData: any[],
  _stockFundCounts: any[],
  _currentPage: number,
  searchedStock: any | null
) => {
  if (!chartRef.current) return;

  // 销毁旧实例
  if (chartInstance.current) {
    chartInstance.current.dispose();
  }

  // 初始化新实例
  const container = chartRef.current;
  const instance = echarts.init(container);
  
  // 更新 chartInstance ref
  // chartInstance.current = instance;

  // 使用分页数据
  const displayData = paginatedData;
  // 反转数据，使最大的在顶部
  const reversedData = [...displayData].reverse();

  // 准备图表数据
  const data = reversedData.map(item => ({
    name: item.name,
    value: item.fundCount
  }));

  // 图表配置
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const item = params[0];
        const stock = reversedData[params[0].dataIndex];
        return `${item.name}<br/>基金数量: ${item.value}只<br/>股票代码: ${stock.code}<br/>所属行业: ${stock.industry}<br/>持仓占比: ${stock.totalRatio}%`;
      }
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '基金数量(只)'
    },
    yAxis: {
      type: 'category',
      data: reversedData.map(item => `${item.name} (${item.code})`),
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 15
      }
    },
    series: [
      {
        name: '基金数量',
        type: 'bar',
        data: data,
        barWidth: '70%',
        itemStyle: {
          color: function(params: any) {
            const stock = reversedData[params.dataIndex];
            return stock.code === searchedStock?.code ? '#f40606ff' : '#45b7d1';
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}只',
          fontSize: 15
        }
      }
    ]
  };

  // 设置配置并渲染
  instance.setOption(option);

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    instance.resize();
  });
};