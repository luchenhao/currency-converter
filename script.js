// 全局变量
let exchangeRates = {};
let currencies = {};
let baseCurrency = 'USD';

// DOM元素
const amountInput = document.getElementById('amount');
const resultInput = document.getElementById('result');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapButton = document.getElementById('swap-btn');
const rateInfo = document.getElementById('rate-info');
const rateValue = document.getElementById('rate-value');
const rateCurrency = document.getElementById('rate-currency');
const updateTime = document.getElementById('update-time');
const popularRates = document.getElementById('popular-rates');

// 常用货币列表
const popularCurrencies = ['EUR', 'GBP', 'JPY', 'HKD', 'MOP', 'TWD','RUB', 'ARS', 'TRY', 'MXN','BRL','EGP','KRW','INR','UAH'];

// 初始化应用
async function initApp() {
    try {
        // 获取汇率数据
        await fetchExchangeRates();
        
        // 填充货币选择器
        populateCurrencySelects();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 显示常用汇率
        displayPopularRates();
        
        // 初始计算
        convertCurrency();
    } catch (error) {
        console.error('初始化应用失败:', error);
        alert('无法加载汇率数据，请稍后再试。');
    }
}

// 获取汇率数据
async function fetchExchangeRates() {
    try {
        // 使用ExchangeRate-API的免费端点
        const response = await fetch('https://open.exchangerate-api.com/v6/latest');
        const data = await response.json();
        
        if (data.result === 'success') {
            exchangeRates = data.rates;
            baseCurrency = data.base_code;
            updateTime.textContent = new Date().toLocaleString();
            
            // 获取货币名称
            await fetchCurrencyNames();
        } else {
            throw new Error('API返回错误');
        }
    } catch (error) {
        console.error('获取汇率数据失败:', error);
        throw error;
    }
}

// 获取货币名称
async function fetchCurrencyNames() {
    try {
        // 这里使用一个静态的货币名称列表，实际应用中可以从API获取
        currencies = {
            "USD": "美元", "AED": "阿联酋迪拉姆", "AFN": "阿富汗尼", "ALL": "阿尔巴尼亚列克", "AMD": "亚美尼亚德拉姆",
			"ANG": "荷属安的列斯盾", "AOA": "安哥拉宽扎", "ARS": "阿根廷比索", "AUD": "澳大利亚元", "AWG": "阿鲁巴弗罗林",
			"AZN": "阿塞拜疆马纳特", "BAM": "波黑可兑换马克", "BBD": "巴巴多斯元", "BDT": "孟加拉塔卡", "BGN": "保加利亚列弗",
			"BHD": "巴林第纳尔", "BIF": "布隆迪法郎", "BMD": "百慕大元", "BND": "文莱元", "BOB": "玻利维亚诺",
			"BRL": "巴西雷亚尔", "BSD": "巴哈马元", "BTN": "不丹努扎姆", "BWP": "博茨瓦纳普拉", "BYN": "白俄罗斯卢布",
			"BZD": "伯利兹元", "CAD": "加拿大元", "CDF": "刚果法郎", "CHF": "瑞士法郎", "CLP": "智利比索",
			"CNY": "人民币", "COP": "哥伦比亚比索", "CRC": "哥斯达黎加科朗", "CUP": "古巴比索", "CVE": "佛得角埃斯库多",
			"CZK": "捷克克朗", "DJF": "吉布提法郎", "DKK": "丹麦克朗", "DOP": "多米尼加比索", "DZD": "阿尔及利亚第纳尔",
			"EGP": "埃及镑", "ERN": "厄立特里亚纳克法", "ETB": "埃塞俄比亚比尔", "EUR": "欧元", "FJD": "斐济元",
			"FKP": "福克兰群岛镑", "FOK": "法罗群岛克朗", "GBP": "英镑", "GEL": "格鲁吉亚拉里", "GGP": "根西镑",
			"GHS": "加纳塞地", "GIP": "直布罗陀镑", "GMD": "冈比亚达拉西", "GNF": "几内亚法郎", "GTQ": "危地马拉格查尔",
			"GYD": "圭亚那元", "HKD": "港币", "HNL": "洪都拉斯伦皮拉", "HRK": "克罗地亚库纳", "HTG": "海地古德",
			"HUF": "匈牙利福林", "IDR": "印尼盾", "ILS": "以色列新谢克尔", "IMP": "马恩岛镑", "INR": "印度卢比",
			"IQD": "伊拉克第纳尔", "IRR": "伊朗里亚尔", "ISK": "冰岛克朗", "JEP": "泽西镑", "JMD": "牙买加元",
			"JOD": "约旦第纳尔", "JPY": "日元", "KES": "肯尼亚先令", "KGS": "吉尔吉斯索姆", "KHR": "柬埔寨瑞尔",
			"KID": "基里巴斯元", "KMF": "科摩罗法郎", "KRW": "韩元", "KWD": "科威特第纳尔", "KYD": "开曼元",
			"KZT": "哈萨克坚戈", "LAK": "老挝基普", "LBP": "黎巴嫩镑", "LKR": "斯里兰卡卢比", "LRD": "利比里亚元",
			"LSL": "莱索托洛蒂", "LYD": "利比亚第纳尔", "MAD": "摩洛哥迪拉姆", "MDL": "摩尔多瓦列伊", "MGA": "马达加斯加阿里亚里",
			"MKD": "北马其顿第纳尔", "MMK": "缅甸元", "MNT": "蒙古图格里克", "MOP": "澳门元", "MRU": "毛里塔尼亚乌吉亚",
			"MUR": "毛里求斯卢比", "MVR": "马尔代夫拉菲亚", "MWK": "马拉维克瓦查", "MXN": "墨西哥比索", "MYR": "马来西亚林吉特",
			"MZN": "莫桑比克梅蒂卡尔", "NAD": "纳米比亚元", "NGN": "尼日利亚奈拉", "NIO": "尼加拉瓜科多巴", "NOK": "挪威克朗",
			"NPR": "尼泊尔卢比", "NZD": "新西兰元", "OMR": "阿曼里亚尔", "PAB": "巴拿马巴波亚", "PEN": "秘鲁索尔",
			"PGK": "巴布亚新几内亚基那", "PHP": "菲律宾比索", "PKR": "巴基斯坦卢比", "PLN": "波兰兹罗提", "PYG": "巴拉圭瓜拉尼",
			"QAR": "卡塔尔里亚尔", "RON": "罗马尼亚列伊", "RSD": "塞尔维亚第纳尔", "RUB": "俄罗斯卢布", "RWF": "卢旺达法郎",
			"SAR": "沙特里亚尔", "SBD": "所罗门群岛元", "SCR": "塞舌尔卢比", "SDG": "苏丹镑", "SEK": "瑞典克朗",
			"SGD": "新加坡元", "SHP": "圣赫勒拿镑", "SLE": "塞拉利昂新利昂", "SLL": "塞拉利昂利昂", "SOS": "索马里先令",
			"SRD": "苏里南元", "SSP": "南苏丹镑", "STN": "圣多美多布拉", "SYP": "叙利亚镑", "SZL": "斯威士兰里兰吉尼",
			"THB": "泰铢", "TJS": "塔吉克斯坦索莫尼", "TMT": "土库曼斯坦马纳特", "TND": "突尼斯第纳尔", "TOP": "汤加潘加",
			"TRY": "土耳其里拉", "TTD": "特立尼达元", "TVD": "图瓦卢元", "TWD": "新台币", "TZS": "坦桑尼亚先令",
			"UAH": "乌克兰格里夫纳", "UGX": "乌干达先令", "UYU": "乌拉圭比索", "UZS": "乌兹别克斯坦索姆", "VES": "委内瑞拉主权玻利瓦尔",
			"VND": "越南盾", "VUV": "瓦努阿图瓦图", "WST": "萨摩亚塔拉", "XAF": "中非法郎", "XCD": "东加勒比元",
			"XCG": "加勒比盾", "XDR": "特别提款权", "XOF": "西非法郎", "XPF": "太平洋法郎", "YER": "也门里亚尔",
			"ZAR": "南非兰特", "ZMW": "赞比亚克瓦查", "ZWL": "津巴布韦元"
        };
        
        // 对于API返回的但不在我们列表中的货币，添加代码作为名称
        Object.keys(exchangeRates).forEach(code => {
            if (!currencies[code]) {
                currencies[code] = code;
            }
        });
    } catch (error) {
        console.error('获取货币名称失败:', error);
        // 如果获取名称失败，至少使用货币代码
        Object.keys(exchangeRates).forEach(code => {
            currencies[code] = code;
        });
    }
}

// 填充货币选择器
function populateCurrencySelects() {
    // 清空现有选项
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    
    // 获取所有货币代码并排序
    const currencyCodes = Object.keys(exchangeRates).sort();
    
    // 添加选项到下拉菜单
    currencyCodes.forEach(code => {
        const name = currencies[code] || code;
        const fromOption = new Option(`${code} - ${name}`, code);
        const toOption = new Option(`${code} - ${name}`, code);
        
        fromCurrencySelect.add(fromOption);
        toCurrencySelect.add(toOption);
    });
    
    // 设置默认值
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'CNY';
}

// 设置事件监听器
function setupEventListeners() {
    // 当输入金额、源货币或目标货币改变时转换货币
    amountInput.addEventListener('input', () => {
        convertCurrency();
        displayPopularRates();
    });
    fromCurrencySelect.addEventListener('change', () => {
        convertCurrency();
        updateRateInfo();
        displayPopularRates();
    });
    toCurrencySelect.addEventListener('change', () => {
        convertCurrency();
        updateRateInfo();
    });
    // 交换货币按钮
    swapButton.addEventListener('click', () => {
        swapCurrencies();
        displayPopularRates();
    });
}

// 转换货币
function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (isNaN(amount) || amount <= 0) {
        resultInput.value = '';
        return;
    }
    
    // 获取汇率
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    
    if (!fromRate || !toRate) {
        resultInput.value = 'N/A';
        return;
    }
    
    // 计算结果
    // 首先转换为基础货币，然后转换为目标货币
    const result = (amount / fromRate) * toRate;
    
    // 显示结果，根据金额大小调整小数位数
    resultInput.value = formatCurrencyValue(result);
    
    // 更新汇率信息
    updateRateInfo();
}

// 格式化货币值
function formatCurrencyValue(value) {
    if (value >= 1000) {
        return value.toFixed(2);
    } else if (value >= 100) {
        return value.toFixed(3);
    } else if (value >= 10) {
        return value.toFixed(4);
    } else {
        return value.toFixed(6);
    }
}

// 更新汇率信息
function updateRateInfo() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    // 获取汇率
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    
    if (!fromRate || !toRate) {
        rateInfo.style.display = 'none';
        return;
    }
    
    // 计算1单位源货币等于多少目标货币
    const rate = toRate / fromRate;
    
    // 更新显示
    rateInfo.style.display = 'block';
    rateInfo.innerHTML = `1 ${fromCurrency} = <span id="rate-value">${formatCurrencyValue(rate)}</span> <span id="rate-currency">${toCurrency}</span>`;
}

// 交换货币
function swapCurrencies() {
    const tempCurrency = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempCurrency;
    
    convertCurrency();
    displayPopularRates();
}

// 显示常用货币金额换算为人民币
function displayPopularRates() {
    // 清空现有内容
    popularRates.innerHTML = '';
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) return;
    // 目标是人民币
    const toRate = exchangeRates['CNY'];
    // 显示常用货币的汇率
    popularCurrencies.forEach(currencyCode => {
        const currencyRate = exchangeRates[currencyCode];
        if (currencyRate) {
            const result = (amount / currencyRate) * toRate;
            const rateCard = document.createElement('div');
            rateCard.className = 'rate-card';
            rateCard.innerHTML = `
                <div class="currency-code">
                    <span>${amount} ${currencyCode} </span>
					<span>=</span>
                    <span>${formatCurrencyValue(result)} CNY</span>
                </div>
                <div class="currency-name">${currencies[currencyCode]}</div>
            `;
            popularRates.appendChild(rateCard);
        }
    });
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
