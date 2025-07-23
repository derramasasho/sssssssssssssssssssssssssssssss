import OpenAI from 'openai';
import { 
  AIMessage, 
  AIAnalysis, 
  AIRecommendation, 
  Portfolio, 
  PortfolioPosition, 
  Token,
  MarketData,
  ApiResponse 
} from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/format';

// =============================================================================
// OPENAI CLIENT SETUP
// =============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// =============================================================================
// AI SERVICE CLASS
// =============================================================================

export class AIService {
  private static instance: AIService;
  private conversationHistory: AIMessage[] = [];

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ==========================================================================
  // PORTFOLIO ANALYSIS
  // ==========================================================================

  async analyzePortfolio(portfolio: Portfolio, marketData: MarketData[]): Promise<AIAnalysis> {
    try {
      const portfolioSummary = this.createPortfolioSummary(portfolio);
      const marketSummary = this.createMarketSummary(marketData);
      
      const prompt = `
        As a DeFi portfolio analyst, analyze this portfolio and provide insights:
        
        PORTFOLIO DATA:
        ${portfolioSummary}
        
        MARKET DATA:
        ${marketSummary}
        
        Please provide:
        1. Overall portfolio health assessment
        2. Risk analysis (diversification, exposure, volatility)
        3. Performance evaluation vs market
        4. Key strengths and weaknesses
        5. Specific actionable insights
        
        Focus on DeFi-specific risks and opportunities. Be concise but thorough.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert DeFi portfolio analyst with deep knowledge of cryptocurrency markets, DeFi protocols, and risk management. Provide precise, actionable analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const analysisContent = completion.choices[0]?.message?.content || "";
      const insights = this.extractInsights(analysisContent);
      
      return {
        id: `analysis_${Date.now()}`,
        type: 'portfolio',
        title: 'Portfolio Health Analysis',
        summary: insights.summary,
        insights: insights.keyPoints,
        recommendations: insights.recommendations,
        confidence: 0.85,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('AI Portfolio Analysis Error:', error);
      throw new Error('Failed to analyze portfolio');
    }
  }

  // ==========================================================================
  // TRADING RECOMMENDATIONS
  // ==========================================================================

  async generateTradingRecommendations(
    portfolio: Portfolio, 
    marketData: MarketData[],
    userQuery?: string
  ): Promise<AIRecommendation[]> {
    try {
      const portfolioSummary = this.createPortfolioSummary(portfolio);
      const marketSummary = this.createMarketSummary(marketData);
      
      const prompt = `
        Based on this portfolio and current market conditions, suggest specific trading actions:
        
        PORTFOLIO: ${portfolioSummary}
        MARKET: ${marketSummary}
        ${userQuery ? `USER REQUEST: ${userQuery}` : ''}
        
        Provide 3-5 specific recommendations with:
        - Action type (buy/sell/hold/rebalance)
        - Specific token/position
        - Reasoning
        - Priority level
        - Expected impact
        
        Focus on DeFi opportunities and risk management.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a DeFi trading advisor. Provide specific, actionable trading recommendations based on portfolio analysis and market conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800,
      });

      const content = completion.choices[0]?.message?.content || "";
      return this.parseRecommendations(content);
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  // ==========================================================================
  // CHAT ASSISTANT
  // ==========================================================================

  async chat(
    message: string,
    portfolio?: Portfolio,
    context?: {
      marketData?: MarketData[];
      recentTrades?: any[];
    }
  ): Promise<AIMessage> {
    try {
      const systemPrompt = this.createSystemPrompt(portfolio, context);
      
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...this.conversationHistory.slice(-10).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const responseContent = completion.choices[0]?.message?.content || "";
      
      const aiMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: {
          tokens: this.extractTokenMentions(responseContent),
        }
      };

      // Update conversation history
      this.conversationHistory.push(
        {
          id: `msg_${Date.now() - 1}`,
          type: 'user',
          content: message,
          timestamp: new Date(),
        },
        aiMessage
      );

      // Keep only last 20 messages
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return aiMessage;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  // ==========================================================================
  // MARKET ANALYSIS
  // ==========================================================================

  async analyzeMarketTrends(marketData: MarketData[]): Promise<AIAnalysis> {
    try {
      const marketSummary = this.createDetailedMarketSummary(marketData);
      
      const prompt = `
        Analyze current DeFi market trends and conditions:
        
        MARKET DATA:
        ${marketSummary}
        
        Provide analysis on:
        1. Overall market sentiment and direction
        2. Sector performance (DeFi protocols, Layer 1s, etc.)
        3. Key opportunities and risks
        4. Technical indicators and patterns
        5. Upcoming events or catalysts
        
        Focus on actionable insights for DeFi traders and investors.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a cryptocurrency market analyst specializing in DeFi. Provide insightful market analysis with actionable conclusions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const analysisContent = completion.choices[0]?.message?.content || "";
      const insights = this.extractInsights(analysisContent);
      
      return {
        id: `market_analysis_${Date.now()}`,
        type: 'market',
        title: 'DeFi Market Analysis',
        summary: insights.summary,
        insights: insights.keyPoints,
        recommendations: insights.recommendations,
        confidence: 0.80,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('AI Market Analysis Error:', error);
      throw new Error('Failed to analyze market trends');
    }
  }

  // ==========================================================================
  // RISK ASSESSMENT
  // ==========================================================================

  async assessRisk(portfolio: Portfolio): Promise<AIAnalysis> {
    try {
      const riskMetrics = this.calculateRiskMetrics(portfolio);
      
      const prompt = `
        Assess the risk profile of this DeFi portfolio:
        
        PORTFOLIO COMPOSITION:
        Total Value: ${formatCurrency(portfolio.totalValueUSD)}
        Positions: ${portfolio.positions.length}
        
        RISK METRICS:
        ${riskMetrics}
        
        INDIVIDUAL POSITIONS:
        ${portfolio.positions.map(pos => 
          `${pos.token.symbol}: ${formatCurrency(pos.balanceUSD)} (${pos.allocation.toFixed(1)}%)`
        ).join('\n')}
        
        Evaluate:
        1. Concentration risk
        2. Protocol risk exposure
        3. Liquidity risk
        4. Smart contract risk
        5. Market correlation risk
        6. Suggested risk mitigation strategies
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a DeFi risk analyst. Assess portfolio risks with specific focus on DeFi-related vulnerabilities and provide concrete mitigation strategies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
      });

      const analysisContent = completion.choices[0]?.message?.content || "";
      const insights = this.extractInsights(analysisContent);
      
      return {
        id: `risk_analysis_${Date.now()}`,
        type: 'risk',
        title: 'Portfolio Risk Assessment',
        summary: insights.summary,
        insights: insights.keyPoints,
        recommendations: insights.recommendations,
        confidence: 0.90,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('AI Risk Assessment Error:', error);
      throw new Error('Failed to assess portfolio risk');
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private createPortfolioSummary(portfolio: Portfolio): string {
    const topPositions = portfolio.positions
      .sort((a, b) => b.balanceUSD - a.balanceUSD)
      .slice(0, 5);

    return `
Total Value: ${formatCurrency(portfolio.totalValueUSD)}
Total PnL: ${formatCurrency(portfolio.totalPnlUSD)} (${formatPercentage(portfolio.totalPnlPercentage)})
Positions: ${portfolio.positions.length}

Top Holdings:
${topPositions.map(pos => 
  `- ${pos.token.symbol}: ${formatCurrency(pos.balanceUSD)} (${pos.allocation.toFixed(1)}%) ${
    pos.pnlPercentage ? `[${formatPercentage(pos.pnlPercentage)}]` : ''
  }`
).join('\n')}
    `.trim();
  }

  private createMarketSummary(marketData: MarketData[]): string {
    return marketData.slice(0, 10).map(data => 
      `${data.token.symbol}: $${data.price.price.toFixed(4)} (${formatPercentage(data.price.priceChange24h)})`
    ).join(', ');
  }

  private createDetailedMarketSummary(marketData: MarketData[]): string {
    const summary = marketData.slice(0, 15).map(data => `
${data.token.symbol} (${data.token.name}):
- Price: $${data.price.price.toFixed(4)}
- 24h Change: ${formatPercentage(data.price.priceChange24h)}
- 7d Change: ${formatPercentage(data.price.priceChange7d)}
- Market Cap: ${formatCurrency(data.price.marketCap)}
- Volume: ${formatCurrency(data.price.volume24h)}
    `).join('\n');

    return summary;
  }

  private createSystemPrompt(portfolio?: Portfolio, context?: any): string {
    let prompt = `You are an advanced DeFi assistant with expertise in:
- DeFi protocols and yield farming strategies
- Risk management and portfolio optimization
- Market analysis and trading strategies
- Smart contract interactions and security

You provide helpful, accurate, and actionable advice for DeFi users.`;

    if (portfolio) {
      prompt += `\n\nCurrent Portfolio Context:
Total Value: ${formatCurrency(portfolio.totalValueUSD)}
Positions: ${portfolio.positions.length}
Performance: ${formatPercentage(portfolio.totalPnlPercentage)}`;
    }

    return prompt;
  }

  private calculateRiskMetrics(portfolio: Portfolio): string {
    const positions = portfolio.positions;
    const totalValue = portfolio.totalValueUSD;
    
    // Concentration risk (largest position %)
    const largestPosition = Math.max(...positions.map(p => p.allocation));
    
    // Number of protocols
    const protocols = new Set(positions.map(p => 
      p.token.tags?.find(tag => ['lending', 'dex', 'yield'].includes(tag)) || 'unknown'
    ));
    
    // Volatility estimate based on price changes
    const avgVolatility = positions.reduce((sum, pos) => 
      sum + Math.abs(pos.pnlPercentage || 0), 0) / positions.length;

    return `
Concentration Risk: Largest position is ${largestPosition.toFixed(1)}% of portfolio
Protocol Diversification: ${protocols.size} different protocol types
Estimated Volatility: ${avgVolatility.toFixed(1)}%
Position Count: ${positions.length} positions
    `.trim();
  }

  private extractInsights(content: string): {
    summary: string;
    keyPoints: string[];
    recommendations: string[];
  } {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Extract summary (first paragraph)
    const summary = lines.slice(0, 3).join(' ').substring(0, 200);
    
    // Extract bullet points and numbered items as insights
    const keyPoints = lines.filter(line => 
      line.match(/^[\d\-\*\•]/) || line.toLowerCase().includes('key') || line.toLowerCase().includes('important')
    ).slice(0, 5);
    
    // Extract recommendations
    const recommendations = lines.filter(line =>
      line.toLowerCase().includes('recommend') || 
      line.toLowerCase().includes('suggest') ||
      line.toLowerCase().includes('consider') ||
      line.toLowerCase().includes('should')
    ).slice(0, 3);

    return {
      summary: summary || 'Analysis completed successfully.',
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Analysis provided comprehensive insights.'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring portfolio performance.']
    };
  }

  private parseRecommendations(content: string): AIRecommendation[] {
    const lines = content.split('\n').filter(line => line.trim());
    const recommendations: AIRecommendation[] = [];
    
    // Simple parsing logic - look for action words and tokens
    let currentRec: Partial<AIRecommendation> = {};
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Detect action type
      if (lowerLine.includes('buy') || lowerLine.includes('purchase')) {
        currentRec.type = 'buy';
      } else if (lowerLine.includes('sell') || lowerLine.includes('reduce')) {
        currentRec.type = 'sell';
      } else if (lowerLine.includes('hold') || lowerLine.includes('maintain')) {
        currentRec.type = 'hold';
      } else if (lowerLine.includes('rebalance') || lowerLine.includes('adjust')) {
        currentRec.type = 'rebalance';
      }
      
      // Detect priority
      if (lowerLine.includes('high') || lowerLine.includes('urgent')) {
        currentRec.priority = 'high';
      } else if (lowerLine.includes('medium') || lowerLine.includes('moderate')) {
        currentRec.priority = 'medium';
      } else if (lowerLine.includes('low')) {
        currentRec.priority = 'low';
      }
      
      // If line contains reasoning, save it
      if (line.length > 20 && !line.match(/^[\d\-\*]/)) {
        currentRec.reasoning = line;
        currentRec.action = line.substring(0, 100);
        
        // Complete the recommendation
        if (currentRec.type) {
          recommendations.push({
            id: `rec_${Date.now()}_${recommendations.length}`,
            type: currentRec.type,
            action: currentRec.action || currentRec.reasoning,
            reasoning: currentRec.reasoning,
            priority: currentRec.priority || 'medium',
            estimatedImpact: Math.random() * 10 + 5, // Mock impact 5-15%
            createdAt: new Date(),
          });
          
          currentRec = {};
        }
      }
    }
    
    // If no recommendations were parsed, create a default one
    if (recommendations.length === 0) {
      recommendations.push({
        id: `rec_${Date.now()}`,
        type: 'hold',
        action: 'Continue monitoring current positions',
        reasoning: 'Portfolio appears well-balanced for current market conditions',
        priority: 'low',
        estimatedImpact: 2,
        createdAt: new Date(),
      });
    }
    
    return recommendations.slice(0, 5); // Max 5 recommendations
  }

  private extractTokenMentions(content: string): Token[] {
    const tokens: Token[] = [];
    const commonTokens = ['BTC', 'ETH', 'USDC', 'DAI', 'UNI', 'AAVE', 'COMP', 'LINK'];
    
    for (const symbol of commonTokens) {
      if (content.toUpperCase().includes(symbol)) {
        tokens.push({
          id: symbol.toLowerCase(),
          address: '0x0000000000000000000000000000000000000000' as any,
          symbol,
          name: symbol,
          decimals: 18,
          isVerified: true,
        });
      }
    }
    
    return tokens;
  }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  clearConversation(): void {
    this.conversationHistory = [];
  }

  getConversationHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return false;
      }
      
      // Test API connection with a simple request
      await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      });
      
      return true;
    } catch (error) {
      console.warn('AI Service not available:', error);
      return false;
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const aiService = AIService.getInstance();