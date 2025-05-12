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
const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD'];

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
            "USD": "美元",
            "EUR": "欧元",
            "GBP": "英镑",
            "JPY": "日元",
            "CNY": "人民币",
            "AUD": "澳大利亚元",
            "CAD": "加拿大元",
            "CHF": "瑞士法郎",
            "HKD": "港币",
            "SGD": "新加坡元",
            "NZD": "新西兰元",
            "INR": "印度卢比",
            "BRL": "巴西雷亚尔",
            "RUB": "俄罗斯卢布",
            "KRW": "韩元",
            "IDR": "印尼盾",
            "TRY": "土耳其里拉",
            "SAR": "沙特里亚尔",
            "SEK": "瑞典克朗",
            "NOK": "挪威克朗",
            "DKK": "丹麦克朗",
            "PLN": "波兰兹罗提",
            "THB": "泰铢",
            "MXN": "墨西哥比索",
            "ZAR": "南非兰特",
            "MYR": "马来西亚林吉特",
            "PHP": "菲律宾比索",
            "TWD": "新台币",
            "CZK": "捷克克朗",
            "ILS": "以色列新谢克尔"
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
    amountInput.addEventListener('input', convertCurrency);
    fromCurrencySelect.addEventListener('change', () => {
        convertCurrency();
        updateRateInfo();
    });
    toCurrencySelect.addEventListener('change', () => {
        convertCurrency();
        updateRateInfo();
    });
    
    // 交换货币按钮
    swapButton.addEventListener('click', swapCurrencies);
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
}

// 显示常用汇率
function displayPopularRates() {
    // 清空现有内容
    popularRates.innerHTML = '';
    
    // 获取基准货币
    const fromCurrency = fromCurrencySelect.value;
    const fromRate = exchangeRates[fromCurrency];
    
    if (!fromRate) return;
    
    // 显示常用货币的汇率
    popularCurrencies.forEach(currencyCode => {
        if (currencyCode !== fromCurrency && exchangeRates[currencyCode]) {
            const rate = exchangeRates[currencyCode] / fromRate;
            const currencyName = currencies[currencyCode] || currencyCode;
            
            const rateCard = document.createElement('div');
            rateCard.className = 'rate-card';
            rateCard.innerHTML = `
                <div class="currency-code">
                    <span>${currencyCode}</span>
                    <span>${formatCurrencyValue(rate)}</span>
                </div>
                <div class="currency-name">${currencyName}</div>
                <div class="rate-value">1 ${fromCurrency} = ${formatCurrencyValue(rate)} ${currencyCode}</div>
            `;
            
            popularRates.appendChild(rateCard);
        }
    });
}

// 当源货币改变时，更新常用汇率显示
fromCurrencySelect.addEventListener('change', displayPopularRates);

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);