1. 获取基金列表，统计基金持仓的股票，按照行业和 股票代码分组，统计股票的权重
2. 统计每个行业的股票权重，按照权重从高到低排序
3. 统计每个股票的权重，按照权重从高到低排序

接口 fundMNNetNewList 获取基金列表
路由:
/fundMNNetNewList

参数
fundtype: 基金类型
全部: 0
股票: 25
混合: 27
货币: 35
QDII: 6
LOF: 4
理财: 2949
SortColumn: 排序列

最新净值: HLDWJZ
七日年化: LJJZ
Sort: 排序方式

降序: desc
升序: asc
Letter: 字母排序

全部: 不写
A: a
B: b
以此类推到z
companyid: 基金公司 id

pageIndex: 页码

pagesize: 每页条数


接口 fundHoldings 获取基金持仓
路由:
/fundHoldings

参数
fundid: 基金 id