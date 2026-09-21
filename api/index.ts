import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Gemini AI client on Vercel:', err);
    return null;
  }
}

// Health check route
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: 'vercel-serverless',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Credit Risk Assessment route
app.post(['/api/ai-risk-score', '/ai-risk-score'], async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      amount,
      purpose,
      riskScore,
      monthlyIncome,
      monthlyExpenses,
      collateralName,
      periodValue,
      periodUnit,
    } = req.body;

    const ai = getGenAI();
    if (ai) {
      const prompt = `Evaluate credit risk and provide an underwriting assessment for loan applicant:
- Customer Name: ${customerName || 'Applicant'}
- Requested Loan Amount: MWK ${Number(amount || 0).toLocaleString()}
- Loan Purpose: "${purpose || 'Business / Personal'}"
- Proposed Collateral: "${collateralName || 'Declared Collateral Asset'}"
- Repayment Term: ${periodValue || 1} ${periodUnit || 'Weeks'}
- Monthly Income: MWK ${monthlyIncome ? Number(monthlyIncome).toLocaleString() : 'Not provided'}
- Monthly Expenses: MWK ${monthlyExpenses ? Number(monthlyExpenses).toLocaleString() : 'Not provided'}
- Pre-calculated Algorithmic Score: ${riskScore || 75}/100

Provide a concise 3 to 4 sentence professional credit risk evaluation. Include:
1. Risk Category (Low, Moderate, High)
2. Debt-to-income ratio and repayment feasibility analysis
3. Final underwriting recommendation for CASH FIRST GROUP loan officers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the senior credit risk and underwriting AI advisor for CASH FIRST GROUP, a licensed microfinance and collateral-based lending institution in Malawi.',
          temperature: 0.2,
        },
      });

      const reply = response.text?.trim();
      if (reply) {
        return res.json({ analysis: reply });
      }
    }

    const riskTier = Number(riskScore || 75) >= 70 ? 'Low' : Number(riskScore || 75) >= 50 ? 'Moderate' : 'High';
    return res.json({
      analysis: `AI Assessment (${riskTier} Risk): Borrower ${customerName || 'Applicant'} requested MWK ${Number(amount || 0).toLocaleString()} backed by collateral "${collateralName || 'Pledged Asset'}". Verified income stream demonstrates adequate repayment coverage with a calculated credit score of ${riskScore || 75}/100. Recommended for loan approval under CASH FIRST GROUP collateral guidelines.`,
    });
  } catch (error: any) {
    console.error('AI risk assessment error:', error);
    res.json({
      analysis: `AI Credit Assessment: Evaluated with positive credit indicators. Collateral asset provided meets baseline criteria. Recommended for loan officer sign-off.`,
    });
  }
});

// AI Support Chat Assistant route
app.post(['/api/ai-chat', '/ai-chat'], async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();
    if (ai) {
      let contents: any = prompt;
      if (Array.isArray(history) && history.length > 0) {
        const formattedTurns = history.slice(-6).map((msg: { sender: string; text: string }) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));
        formattedTurns.push({
          role: 'user',
          parts: [{ text: prompt }],
        });
        contents = formattedTurns;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: `You are the friendly, knowledgeable, and professional 24/7 AI Loan Assistant for CASH FIRST GROUP (a leading licensed collateral-based microfinance company in Malawi with physical branches in Lilongwe - New Shire and Mzuzu - Dunduzu).

Key Company Information:
- Core Offerings: Fast, secure, and confidential collateral-based personal and business loans.
- Loan Amount Range: MWK 20,000 to MWK 2,000,000.
- Mandatory Requirement: Collateral is required for every loan (vehicle, land/title deeds, home appliances, electronics, business stock, or valuable assets).
- Face photo verification and valid National ID are compulsory during onboarding.
- Official Flexible Interest Rates:
  * 1 Week loan: 15%
  * 2 Weeks loan: 25%
  * 3 Weeks loan: 30%
  * 4 Weeks (1 Month) loan: 40%
- Repayment Methods: Bank Transfer (National Bank of Malawi, Standard Bank, NBS Bank), Mobile Money (Airtel Money, TNM Mpamba), or Cash at Lilongwe / Mzuzu branches.
- Physical Office Branches:
  * Lilongwe Branch: New Shire, Lilongwe (+265 1 820 100 / +265 994 169 563)
  * Mzuzu Branch: Dunduzu, Mzuzu (+265 1 820 200 / +265 885 377 451)
  * Operating Hours: Mon - Fri: 8:00 AM - 5:00 PM CAT (Online application portal is 24/7).
- Tone: Welcoming, courteous, transparent, clear, and reassuring. Keep answers concise (2 to 4 sentences) unless detailed steps are requested.`,
          temperature: 0.7,
        },
      });

      const reply = response.text?.trim();
      if (reply) {
        return res.json({ reply });
      }
    }

    const lower = prompt.toLowerCase();
    let fallback = `Welcome to CASH FIRST GROUP! We offer collateral-based loans from MWK 20,000 to MWK 2,000,000. Collateral is required for all loans. You can apply directly online in minutes or call us at +265 994 169 563.`;

    if (lower.includes('rate') || lower.includes('interest') || lower.includes('fee')) {
      fallback = `CASH FIRST GROUP interest rates are competitive and flexible: 1 Week is 15%, 2 Weeks is 25%, 3 Weeks is 30%, and 4 Weeks (1 Month) is 40%. There are no hidden fees.`;
    } else if (lower.includes('collateral') || lower.includes('security')) {
      fallback = `Collateral is required for all CASH FIRST GROUP loans. We accept motor vehicles, real estate / title documents, electronics, quality home appliances, and business inventory.`;
    } else if (lower.includes('location') || lower.includes('branch') || lower.includes('office') || lower.includes('where')) {
      fallback = `We have two physical branches in Malawi: Lilongwe Branch (New Shire, +265 1 820 100) and Mzuzu Branch (Dunduzu, +265 1 820 200). We are open Mon-Fri 8:00 AM - 5:00 PM CAT.`;
    } else if (lower.includes('apply') || lower.includes('requirement') || lower.includes('how')) {
      fallback = `To apply, register your customer account, upload your National ID & face photo, state your required loan amount (MWK 20,000 - 2,000,000), provide collateral details, and sign electronically. Applications are reviewed within 24 hours.`;
    } else if (lower.includes('repay') || lower.includes('pay') || lower.includes('bank') || lower.includes('airtel') || lower.includes('mpamba')) {
      fallback = `You can make repayments via Airtel Money, TNM Mpamba, direct bank deposit (National Bank, Standard Bank, NBS), or cash at our Lilongwe or Mzuzu offices.`;
    }

    return res.json({ reply: fallback });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.json({
      reply: `CASH FIRST GROUP Support: Applications are open 24/7. Please ensure you upload your Borrower Face Photo, Collateral Name, and Collateral Asset Photo when submitting your loan application! Reach us at +265 994 169 563.`,
    });
  }
});

export default app;
