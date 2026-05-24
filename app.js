// 投资数据监控中心 - 主应用
class InvestmentDashboard {
    constructor() {
        this.data = {
            vix: null,
            pe: null,
            fearGreed: null,
            ndx: null,
            gold: null
        };
        this.charts = {
            trend: null,
            ndx: null,
            gold: null
        };
        this.updateInterval = null;
        this.currentPeriod = '1M';
        this.currentTab = 'market';
        this.ndxPeriod = '1M';
        this.goldPeriod = '1M';
        
        // 历史数据缓存
        this.historicalData = {
            vix: [],
            pe: [],
            fearGreed: [],
            ndx: [],
            gold: []
        };
        
        this.init();
    }
    
    init() {
        this.setupTabNavigation();
        this.setupEventListeners();
        this.fetchAllData();
        this.updateInterval = setInterval(() => this.fetchAllData(), 5 * 60 * 1000);
    }
    
    // Tab 导航切换
    setupTabNavigation() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }
    
    switchTab(tabName) {
        // 更新导航按钮状态
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        this.currentTab = tabName;
        
        // 如果切换到NDX或黄金Tab，初始化对应图表
        if (tabName === 'ndx' && !this.charts.ndx) {
            this.updateNDXChart();
        }
        if (tabName === 'gold' && !this.charts.gold) {
            this.updateGoldChart();
        }
    }
    
    setupEventListeners() {
        // 市场指标图表周期切换
        document.querySelectorAll('#tab-market .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#tab-market .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.updateTrendChart();
            });
        });
        
        // NDX图表周期切换
        document.querySelectorAll('.ndx-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.ndx-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.ndxPeriod = e.target.dataset.ndxPeriod;
                this.updateNDXChart();
            });
        });
        
        // 黄金图表周期切换
        document.querySelectorAll('.gold-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gold-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.goldPeriod = e.target.dataset.goldPeriod;
                this.updateGoldChart();
            });
        });
    }
    
    async fetchAllData() {
        this.updateLastUpdateTime();
        
        try {
            await Promise.all([
                this.fetchVIXData(),
                this.fetchPEData(),
                this.fetchFearGreedData(),
                this.fetchNDXData(),
                this.fetchGoldData()
            ]);
            
            this.updateUI();
            this.generateInvestmentAdvice();
            this.generateGoldAdvice();
            this.updateTrendChart();
            
            // 如果当前在NDX或黄金Tab，更新对应图表
            if (this.currentTab === 'ndx') {
                this.updateNDXChart();
            }
            if (this.currentTab === 'gold') {
                this.updateGoldChart();
            }
            
        } catch (error) {
            console.error('数据获取失败:', error);
            this.handleError();
        }
    }
    
    // ===== VIX数据 =====
    async fetchVIXData() {
        const mockVIX = this.generateMockVIX();
        this.data.vix = mockVIX;
        this.historicalData.vix = this.generateHistoricalData('vix', 365);
    }
    
    generateMockVIX() {
        const baseValue = 18;
        const variation = (Math.random() - 0.5) * 10;
        const value = Math.max(10, Math.min(45, baseValue + variation));
        
        return {
            value: parseFloat(value.toFixed(2)),
            change: parseFloat(((Math.random() - 0.5) * 4).toFixed(2)),
            changePercent: parseFloat(((Math.random() - 0.5) * 15).toFixed(2)),
            timestamp: new Date().toISOString()
        };
    }
    
    // ===== PE数据 =====
    async fetchPEData() {
        const mockPE = this.generateMockPE();
        this.data.pe = mockPE;
        this.historicalData.pe = this.generateHistoricalData('pe', 365);
    }
    
    generateMockPE() {
        const baseValue = 32;
        const variation = (Math.random() - 0.5) * 6;
        const value = Math.max(20, Math.min(45, baseValue + variation));
        
        return {
            value: parseFloat(value.toFixed(2)),
            change: parseFloat(((Math.random() - 0.5) * 1).toFixed(2)),
            changePercent: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
            timestamp: new Date().toISOString()
        };
    }
    
    // ===== 恐惧贪婪指数 =====
    async fetchFearGreedData() {
        const mockFearGreed = this.generateMockFearGreed();
        this.data.fearGreed = mockFearGreed;
        this.historicalData.fearGreed = this.generateHistoricalData('fearGreed', 365);
    }
    
    generateMockFearGreed() {
        const baseValue = 45;
        const variation = (Math.random() - 0.5) * 30;
        const value = Math.max(5, Math.min(95, baseValue + variation));
        
        return {
            value: Math.round(value),
            change: Math.round((Math.random() - 0.5) * 10),
            rating: this.getFearGreedRating(value),
            timestamp: new Date().toISOString()
        };
    }
    
    getFearGreedRating(value) {
        if (value <= 24) return '极度恐惧';
        if (value <= 49) return '恐惧';
        if (value === 50) return '中性';
        if (value <= 74) return '贪婪';
        return '极度贪婪';
    }
    
    // ===== 纳斯达克100数据 =====
    async fetchNDXData() {
        const mockNDX = this.generateMockNDX();
        this.data.ndx = mockNDX;
        this.historicalData.ndx = this.generateHistoricalData('ndx', 365);
    }
    
    generateMockNDX() {
        // 纳斯达克100当前约20000点左右
        const basePrice = 19800;
        const variation = (Math.random() - 0.5) * 400;
        const price = basePrice + variation;
        const change = (Math.random() - 0.5) * 200;
        const changePercent = (change / price) * 100;
        
        return {
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            open: parseFloat((price - change + (Math.random() - 0.5) * 50).toFixed(2)),
            high: parseFloat((price + Math.random() * 100).toFixed(2)),
            low: parseFloat((price - Math.random() * 100).toFixed(2)),
            prevClose: parseFloat((price - change).toFixed(2)),
            timestamp: new Date().toISOString()
        };
    }
    
    // ===== 黄金数据 =====
    async fetchGoldData() {
        const mockGold = this.generateMockGold();
        this.data.gold = mockGold;
        this.historicalData.gold = this.generateHistoricalData('gold', 365);
    }
    
    generateMockGold() {
        // AU9999 当前约550-580元/克
        const basePrice = 565;
        const variation = (Math.random() - 0.5) * 20;
        const price = basePrice + variation;
        const change = (Math.random() - 0.5) * 8;
        const changePercent = (change / price) * 100;
        
        return {
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            open: parseFloat((price - change + (Math.random() - 0.5) * 3).toFixed(2)),
            high: parseFloat((price + Math.random() * 5).toFixed(2)),
            low: parseFloat((price - Math.random() * 5).toFixed(2)),
            prevClose: parseFloat((price - change).toFixed(2)),
            timestamp: new Date().toISOString()
        };
    }
    
    // 生成历史数据
    generateHistoricalData(type, days) {
        const data = [];
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            let value;
            switch(type) {
                case 'vix':
                    value = 15 + Math.random() * 20 + Math.sin(i / 5) * 5;
                    break;
                case 'pe':
                    value = 28 + Math.random() * 10 + Math.sin(i / 10) * 3;
                    break;
                case 'fearGreed':
                    value = 30 + Math.random() * 40 + Math.sin(i / 7) * 15;
                    break;
                case 'ndx':
                    // NDX从18000涨到20000左右的趋势
                    value = 18000 + (days - i) * (2000 / days) + Math.random() * 300;
                    break;
                case 'gold':
                    // 黄金从520涨到565左右的趋势
                    value = 520 + (days - i) * (45 / days) + Math.random() * 10;
                    break;
            }
            
            data.push({
                date: date.toISOString().split('T')[0],
                value: parseFloat(value.toFixed(2))
            });
        }
        
        return data;
    }    // ===== 更新UI =====
    updateUI() {
        this.updateVIXCard();
        this.updatePECard();
        this.updateFearGreedCard();
        this.updateNDXCard();
        this.updateGoldCard();
    }
    
    updateVIXCard() {
        const vix = this.data.vix;
        if (!vix) return;
        
        document.getElementById('vixValue').textContent = vix.value.toFixed(2);
        
        const changeEl = document.getElementById('vixChange');
        const changeSymbol = vix.change >= 0 ? '+' : '';
        changeEl.textContent = `${changeSymbol}${vix.change.toFixed(2)} (${changeSymbol}${vix.changePercent.toFixed(2)}%)`;
        changeEl.className = `change-value ${vix.change >= 0 ? 'positive' : 'negative'}`;
        
        const gaugePercent = Math.min(100, (vix.value / 50) * 100);
        document.getElementById('vixGauge').style.width = `${gaugePercent}%`;
        
        const statusEl = document.getElementById('vixStatus');
        if (vix.value < 15) {
            statusEl.textContent = '市场平静';
            statusEl.className = 'status-badge calm';
        } else if (vix.value < 20) {
            statusEl.textContent = '轻度恐慌';
            statusEl.className = 'status-badge mild';
        } else if (vix.value < 30) {
            statusEl.textContent = '恐慌';
            statusEl.className = 'status-badge fear';
        } else {
            statusEl.textContent = '极度恐慌';
            statusEl.className = 'status-badge extreme-fear';
        }
    }
    
    updatePECard() {
        const pe = this.data.pe;
        if (!pe) return;
        
        document.getElementById('peValue').textContent = pe.value.toFixed(2);
        
        const changeEl = document.getElementById('peChange');
        const changeSymbol = pe.change >= 0 ? '+' : '';
        changeEl.textContent = `${changeSymbol}${pe.change.toFixed(2)} (${changeSymbol}${pe.changePercent.toFixed(2)}%)`;
        changeEl.className = `change-value ${pe.change >= 0 ? 'positive' : 'negative'}`;
        
        const gaugePercent = Math.min(100, (pe.value / 50) * 100);
        document.getElementById('peGauge').style.width = `${gaugePercent}%`;
        
        const statusEl = document.getElementById('peStatus');
        if (pe.value < 20) {
            statusEl.textContent = '低估';
            statusEl.className = 'status-badge undervalued';
        } else if (pe.value < 30) {
            statusEl.textContent = '合理';
            statusEl.className = 'status-badge fair';
        } else if (pe.value < 40) {
            statusEl.textContent = '偏高';
            statusEl.className = 'status-badge overvalued';
        } else {
            statusEl.textContent = '高估';
            statusEl.className = 'status-badge overvalued';
        }
    }
    
    updateFearGreedCard() {
        const fg = this.data.fearGreed;
        if (!fg) return;
        
        document.getElementById('fearGreedValue').textContent = fg.value;
        
        const changeEl = document.getElementById('fearGreedChange');
        const changeSymbol = fg.change >= 0 ? '+' : '';
        changeEl.textContent = `${changeSymbol}${fg.change}`;
        changeEl.className = `change-value ${fg.change >= 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('fearGreedGauge').style.width = `${fg.value}%`;
        
        const statusEl = document.getElementById('fearGreedStatus');
        statusEl.textContent = fg.rating;
        
        if (fg.value <= 24) {
            statusEl.className = 'status-badge extreme-fear';
        } else if (fg.value <= 49) {
            statusEl.className = 'status-badge fear';
        } else if (fg.value === 50) {
            statusEl.className = 'status-badge fair';
        } else if (fg.value <= 74) {
            statusEl.className = 'status-badge mild';
        } else {
            statusEl.className = 'status-badge extreme-greed';
        }
    }
    
    updateNDXCard() {
        const ndx = this.data.ndx;
        if (!ndx) return;
        
        document.getElementById('ndxPrice').textContent = ndx.price.toLocaleString('zh-CN', {minimumFractionDigits: 2});
        
        const changeEl = document.getElementById('ndxChange');
        const changeSymbol = ndx.change >= 0 ? '+' : '';
        changeEl.textContent = `${changeSymbol}${ndx.change.toFixed(2)} (${changeSymbol}${ndx.changePercent.toFixed(2)}%)`;
        changeEl.className = `price-change ${ndx.change >= 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('ndxOpen').textContent = ndx.open.toLocaleString('zh-CN', {minimumFractionDigits: 2});
        document.getElementById('ndxHigh').textContent = ndx.high.toLocaleString('zh-CN', {minimumFractionDigits: 2});
        document.getElementById('ndxLow').textContent = ndx.low.toLocaleString('zh-CN', {minimumFractionDigits: 2});
        document.getElementById('ndxPrevClose').textContent = ndx.prevClose.toLocaleString('zh-CN', {minimumFractionDigits: 2});
    }
    
    updateGoldCard() {
        const gold = this.data.gold;
        if (!gold) return;
        
        document.getElementById('goldPrice').textContent = gold.price.toFixed(2);
        
        const changeEl = document.getElementById('goldChange');
        const changeSymbol = gold.change >= 0 ? '+' : '';
        changeEl.textContent = `${changeSymbol}${gold.change.toFixed(2)} (${changeSymbol}${gold.changePercent.toFixed(2)}%)`;
        changeEl.className = `price-change ${gold.change >= 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('goldOpen').textContent = gold.open.toFixed(2);
        document.getElementById('goldHigh').textContent = gold.high.toFixed(2);
        document.getElementById('goldLow').textContent = gold.low.toFixed(2);
        document.getElementById('goldPrevClose').textContent = gold.prevClose.toFixed(2);
    }
    
    // ===== 定投建议 =====
    generateInvestmentAdvice() {
        const vix = this.data.vix?.value || 20;
        const pe = this.data.pe?.value || 30;
        const fearGreed = this.data.fearGreed?.value || 50;
        
        let score = 50;
        
        if (vix > 30) score += 25;
        else if (vix > 25) score += 15;
        else if (vix > 20) score += 5;
        else if (vix < 15) score -= 10;
        
        if (pe < 20) score += 20;
        else if (pe < 25) score += 10;
        else if (pe > 35) score -= 15;
        else if (pe > 40) score -= 25;
        
        if (fearGreed < 20) score += 20;
        else if (fearGreed < 30) score += 15;
        else if (fearGreed < 40) score += 5;
        else if (fearGreed > 75) score -= 20;
        else if (fearGreed > 60) score -= 10;
        
        score = Math.max(0, Math.min(100, score));
        
        const scoreCircle = document.getElementById('adviceScore');
        const scoreDeg = (score / 100) * 360;
        scoreCircle.style.setProperty('--score-deg', `${scoreDeg}deg`);
        document.getElementById('scoreValue').textContent = Math.round(score);
        
        let title, description, amount, frequency, risk;
        
        if (score >= 80) {
            title = '🔥 极佳定投时机';
            description = '市场处于极度恐慌状态，VIX高企，估值偏低。这是长期投资者的黄金买入机会，建议加大定投力度。';
            amount = '建议金额的 150-200%';
            frequency = '每周定投';
            risk = '低（逆向布局）';
        } else if (score >= 60) {
            title = '✅ 较好的定投时机';
            description = '市场情绪偏悲观或估值合理，适合正常定投。保持纪律性投资，积累筹码。';
            amount = '建议金额的 100-120%';
            frequency = '每周/每双周定投';
            risk = '中低';
        } else if (score >= 40) {
            title = '➡️ 正常定投';
            description = '市场情绪中性，估值合理。坚持常规定投计划，不追涨杀跌。';
            amount = '建议金额的 100%';
            frequency = '每月定投';
            risk = '中等';
        } else if (score >= 20) {
            title = '⚠️ 谨慎定投';
            description = '市场情绪偏贪婪或估值偏高。建议减少定投金额，保留现金等待更好机会。';
            amount = '建议金额的 50-70%';
            frequency = '每月定投';
            risk = '中高';
        } else {
            title = '🛑 暂停定投';
            description = '市场极度贪婪，估值过高。建议暂停新定投，持有现有仓位，等待回调后再入场。';
            amount = '暂停 / 最低维持';
            frequency = '暂停';
            risk = '高';
        }
        
        document.getElementById('adviceTitle').textContent = title;
        document.getElementById('adviceDescription').textContent = description;
        document.getElementById('suggestedAmount').textContent = amount;
        document.getElementById('suggestedFrequency').textContent = frequency;
        document.getElementById('riskLevel').textContent = risk;
        
        this.updateStrategyCards(vix, pe, fearGreed);
    }
    
    updateStrategyCards(vix, pe, fearGreed) {
        let vixStrategy;
        if (vix > 30) vixStrategy = 'VIX > 30，极度恐慌，强烈建议加大定投';
        else if (vix > 25) vixStrategy = 'VIX > 25，恐慌情绪明显，适合增加定投';
        else if (vix > 20) vixStrategy = 'VIX > 20，轻度恐慌，正常定投';
        else if (vix < 15) vixStrategy = 'VIX < 15，市场平静，注意风险';
        else vixStrategy = 'VIX正常范围，按计划定投';
        document.getElementById('vixStrategyText').textContent = vixStrategy;
        
        let peStrategy;
        if (pe < 20) peStrategy = 'PE < 20，严重低估，加大定投力度';
        else if (pe < 25) peStrategy = 'PE < 25，低估区域，适合定投';
        else if (pe < 30) peStrategy = 'PE 25-30，合理估值，正常定投';
        else if (pe < 35) peStrategy = 'PE 30-35，偏高估值，谨慎定投';
        else peStrategy = 'PE > 35，高估区域，减少定投';
        document.getElementById('peStrategyText').textContent = peStrategy;
        
        let sentimentStrategy;
        if (fearGreed < 20) sentimentStrategy = '极度恐惧，逆向投资的最佳时机';
        else if (fearGreed < 30) sentimentStrategy = '恐惧情绪，适合逐步建仓';
        else if (fearGreed < 45) sentimentStrategy = '偏恐惧，保持定投节奏';
        else if (fearGreed > 75) sentimentStrategy = '极度贪婪，考虑暂停定投';
        else if (fearGreed > 60) sentimentStrategy = '贪婪情绪，减少定投金额';
        else sentimentStrategy = '情绪中性，按计划执行';
        document.getElementById('sentimentStrategyText').textContent = sentimentStrategy;
    }    // ===== 黄金加仓建议（核心算法）=====
    generateGoldAdvice() {
        const gold = this.data.gold;
        if (!gold) return;
        
        const price = gold.price;
        const change = gold.change;
        const changePercent = gold.changePercent;
        
        // 获取历史数据计算技术指标
        const goldHistory = this.historicalData.gold;
        const prices = goldHistory.map(d => d.value);
        
        // 计算移动平均线
        const ma20 = this.calculateMA(prices, 20);
        const ma60 = this.calculateMA(prices, 60);
        
        // 计算RSI
        const rsi = this.calculateRSI(prices, 14);
        
        // 计算布林带
        const bollinger = this.calculateBollinger(prices, 20);
        
        // 综合评分系统
        let score = 50; // 基础分
        
        // 1. 趋势分析（价格vs均线）
        if (price > ma20 && ma20 > ma60) score += 15; // 多头排列
        else if (price < ma20 && ma20 < ma60) score -= 15; // 空头排列
        else if (price > ma20) score += 5; // 短期向上
        
        // 2. RSI分析
        if (rsi < 30) score += 20; // 超卖，买入机会
        else if (rsi < 40) score += 10;
        else if (rsi > 70) score -= 20; // 超买，谨慎
        else if (rsi > 60) score -= 10;
        
        // 3. 布林带分析
        if (price < bollinger.lower) score += 15; // 跌破下轨，反弹机会
        else if (price > bollinger.upper) score -= 15; // 突破上轨，可能回调
        
        // 4. 当日涨跌分析
        if (changePercent < -2) score += 10; // 大跌，逢低吸纳
        else if (changePercent > 2) score -= 10; // 大涨，不宜追高
        
        // 限制分数范围
        score = Math.max(0, Math.min(100, score));
        
        // 生成建议
        this.renderGoldAdvice(score, price, ma20, ma60, rsi, bollinger, changePercent);
    }
    
    calculateMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }
    
    calculateRSI(prices, period) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    calculateBollinger(prices, period) {
        const ma = this.calculateMA(prices, period);
        const stdDev = this.calculateStdDev(prices.slice(-period), ma);
        
        return {
            upper: ma + (2 * stdDev),
            middle: ma,
            lower: ma - (2 * stdDev)
        };
    }
    
    calculateStdDev(values, mean) {
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }
    
    renderGoldAdvice(score, price, ma20, ma60, rsi, bollinger, changePercent) {
        // 信号图标和标题
        const signalIcon = document.getElementById('signalIcon');
        const adviceTitle = document.getElementById('goldAdviceTitle');
        const adviceDesc = document.getElementById('goldAdviceDesc');
        
        let icon, title, desc, action, ratio, target, stopLoss;
        
        if (score >= 75) {
            icon = '🚀';
            title = '强烈建议加仓';
            desc = '技术面显示黄金处于超卖区域，RSI偏低，价格接近布林带下轨，是较好的买入时机。';
            action = '大幅加仓';
            ratio = '建议仓位的 30-50%';
            target = (price * 1.05).toFixed(2);
            stopLoss = (price * 0.97).toFixed(2);
        } else if (score >= 55) {
            icon = '✅';
            title = '建议加仓';
            desc = '技术指标偏向积极，短期趋势向上，可适度增加黄金基金仓位。';
            action = '适度加仓';
            ratio = '建议仓位的 15-25%';
            target = (price * 1.04).toFixed(2);
            stopLoss = (price * 0.975).toFixed(2);
        } else if (score >= 40) {
            icon = '➡️';
            title = '持仓观望';
            desc = '市场信号中性，建议维持现有仓位，等待更明确的入场信号。';
            action = '维持现状';
            ratio = '暂不新增';
            target = (price * 1.03).toFixed(2);
            stopLoss = (price * 0.98).toFixed(2);
        } else if (score >= 25) {
            icon = '⚠️';
            title = '谨慎减仓';
            desc = '技术指标显示黄金可能超买，RSI偏高，建议适当降低仓位。';
            action = '逐步减仓';
            ratio = '减仓 20-30%';
            target = (price * 1.02).toFixed(2);
            stopLoss = (price * 0.985).toFixed(2);
        } else {
            icon = '🛑';
            title = '建议减仓';
            desc = '技术面显示严重超买，价格突破布林带上轨，建议大幅减仓或清仓观望。';
            action = '大幅减仓';
            ratio = '减仓 50%以上';
            target = (price * 1.01).toFixed(2);
            stopLoss = (price * 0.99).toFixed(2);
        }
        
        signalIcon.textContent = icon;
        adviceTitle.textContent = title;
        adviceDesc.textContent = desc;
        
        document.getElementById('goldAction').textContent = action;
        document.getElementById('goldRatio').textContent = ratio;
        document.getElementById('goldTarget').textContent = `¥${target}`;
        document.getElementById('goldStopLoss').textContent = `¥${stopLoss}`;
        
        // 技术面分析
        let techText = `当前金价 ¥${price.toFixed(2)}。`;
        techText += `RSI指标 ${rsi.toFixed(1)}，`;
        if (rsi < 30) techText += '处于超卖区域，反弹概率大。';
        else if (rsi > 70) techText += '处于超买区域，回调风险高。';
        else techText += '处于中性区域。';
        
        techText += ` 价格${price > ma20 ? '高于' : '低于'}20日均线(¥${ma20.toFixed(2)})，`;
        techText += `${price > bollinger.upper ? '突破布林带上轨' : price < bollinger.lower ? '跌破布林带下轨' : '在布林带中轨附近'}。`;
        
        document.getElementById('techAnalysis').textContent = techText;
        
        // 基本面分析
        let fundText = '黄金作为避险资产，受美联储货币政策、地缘政治风险、美元走势影响较大。';
        fundText += '当前建议关注：美联储利率决议、美元指数DXY走势、全球地缘政治局势。';
        if (changePercent > 1) fundText += ' 今日金价上涨，避险情绪升温。';
        else if (changePercent < -1) fundText += ' 今日金价回调，或为入场机会。';
        
        document.getElementById('fundAnalysis').textContent = fundText;
        
        // 风险提示
        let riskText = '黄金投资存在价格波动风险，建议：';
        riskText += '1) 不要满仓操作，保持适当现金比例；';
        riskText += '2) 设置止损位，控制单笔亏损；';
        riskText += '3) 分批建仓，避免一次性大额投入；';
        riskText += '4) 长期持有，避免频繁交易。';
        
        document.getElementById('riskAnalysis').textContent = riskText;
    }
    
    // ===== 图表渲染 =====
    updateTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        
        const days = this.getPeriodDays(this.currentPeriod);
        const labels = this.historicalData.vix.slice(-days).map(d => d.date.slice(5));
        
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'VIX指数',
                        data: this.historicalData.vix.slice(-days).map(d => d.value),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: '恐惧贪婪指数',
                        data: this.historicalData.fearGreed.slice(-days).map(d => d.value),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: '#94a3b8' } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, title: { display: true, text: 'VIX', color: '#ef4444' } },
                    y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#94a3b8' }, title: { display: true, text: '恐惧贪婪', color: '#8b5cf6' }, min: 0, max: 100 }
                }
            }
        });
    }
    
    updateNDXChart() {
        const ctx = document.getElementById('ndxChart');
        if (!ctx) return;
        
        const days = this.getPeriodDays(this.ndxPeriod);
        const data = this.historicalData.ndx.slice(-days);
        const labels = data.map(d => d.date.slice(5));
        
        if (this.charts.ndx) {
            this.charts.ndx.destroy();
        }
        
        this.charts.ndx = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '纳斯达克100指数',
                    data: data.map(d => d.value),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'NDX: ' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
    
    updateGoldChart() {
        const ctx = document.getElementById('goldChart');
        if (!ctx) return;
        
        const days = this.getPeriodDays(this.goldPeriod);
        const data = this.historicalData.gold.slice(-days);
        const labels = data.map(d => d.date.slice(5));
        
        if (this.charts.gold) {
            this.charts.gold.destroy();
        }
        
        this.charts.gold = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AU9999 (元/克)',
                    data: data.map(d => d.value),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '金价: ¥' + context.parsed.y.toFixed(2) + '/克';
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
    
    getPeriodDays(period) {
        switch(period) {
            case '1M': return 30;
            case '3M': return 90;
            case '6M': return 180;
            case '1Y': return 365;
            default: return 30;
        }
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('lastUpdateTime').textContent = timeString;
    }
    
    handleError() {
        document.getElementById('adviceTitle').textContent = '数据获取失败';
        document.getElementById('adviceDescription').textContent = '请检查网络连接，稍后自动重试...';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new InvestmentDashboard();
});

function refreshData() {
    location.reload();
}
