// 纳斯达克市场数据监控 - 主应用
class NasdaqDashboard {
    constructor() {
        this.data = {
            vix: null,
            pe: null,
            fearGreed: null
        };
        this.chart = null;
        this.updateInterval = null;
        this.currentPeriod = '1M';
        
        // API端点
        this.apis = {
            vix: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX',
            nasdaq: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC',
            fearGreed: 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata'
        };
        
        // 历史数据缓存
        this.historicalData = {
            vix: [],
            pe: [],
            fearGreed: []
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.fetchAllData();
        this.updateInterval = setInterval(() => this.fetchAllData(), 5 * 60 * 1000);
    }
    
    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.updateChart();
            });
        });
    }
    
    async fetchAllData() {
        this.updateLastUpdateTime();
        
        try {
            await Promise.all([
                this.fetchVIXData(),
                this.fetchPEData(),
                this.fetchFearGreedData()
            ]);
            
            this.updateUI();
            this.generateInvestmentAdvice();
            this.updateChart();
            
        } catch (error) {
            console.error('数据获取失败:', error);
            this.handleError();
        }
    }
    
    async fetchVIXData() {
        try {
            const mockVIX = this.generateMockVIX();
            this.data.vix = mockVIX;
            this.historicalData.vix = this.generateHistoricalData('vix', 30);
        } catch (error) {
            console.error('VIX数据获取失败:', error);
            throw error;
        }
    }
    
    async fetchPEData() {
        try {
            const mockPE = this.generateMockPE();
            this.data.pe = mockPE;
            this.historicalData.pe = this.generateHistoricalData('pe', 30);
        } catch (error) {
            console.error('PE数据获取失败:', error);
            throw error;
        }
    }
    
    async fetchFearGreedData() {
        try {
            const mockFearGreed = this.generateMockFearGreed();
            this.data.fearGreed = mockFearGreed;
            this.historicalData.fearGreed = this.generateHistoricalData('fearGreed', 30);
        } catch (error) {
            console.error('恐惧贪婪指数获取失败:', error);
            throw error;
        }
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
            }
            
            data.push({
                date: date.toISOString().split('T')[0],
                value: parseFloat(value.toFixed(2))
            });
        }
        
        return data;
    }    updateUI() {
        this.updateVIXCard();
        this.updatePECard();
        this.updateFearGreedCard();
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
    }    updateStrategyCards(vix, pe, fearGreed) {
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
    }
    
    updateChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        
        const days = this.getPeriodDays();
        const labels = this.historicalData.vix.slice(-days).map(d => d.date.slice(5));
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
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
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        title: {
                            display: true,
                            text: 'VIX',
                            color: '#ef4444'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        title: {
                            display: true,
                            text: '恐惧贪婪',
                            color: '#8b5cf6'
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }
    
    getPeriodDays() {
        switch(this.currentPeriod) {
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

document.addEventListener('DOMContentLoaded', () => {
    new NasdaqDashboard();
});

function refreshData() {
    location.reload();
}
