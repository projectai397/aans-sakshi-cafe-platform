import html2pdf from 'html2pdf.js';

export const generatePDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' },
  };

  html2pdf().set(opt).from(element).save();
};

export const downloadResearchSummary = () => {
  const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #0066cc; border-bottom: 3px solid #0066cc; padding-bottom: 10px;">
        AANS: Autonomous AI Neural System
      </h1>
      <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
        <strong>Comprehensive Research Summary</strong><br/>
        Generated: ${new Date().toLocaleDateString()}<br/>
        India's First Three-Division Conscious AI Platform Company
      </p>

      <h2 style="color: #0066cc; margin-top: 30px;">Executive Summary</h2>
      <p>AANS Private Limited operates three synergistic divisions that transform business operations, consumer wellness, and underground culture through measurable impact and shared values. Founded in 2025 and headquartered in Ahmedabad, Gujarat, the company combines the Sakshi Manifest (seven principles of conscious living) with the Seva Token System (unified impact measurement currency).</p>

      <h2 style="color: #0066cc; margin-top: 30px;">Three Divisions</h2>
      
      <h3 style="color: #00a8cc;">1. AVE (Autonomous Value Engine) - B2B SaaS</h3>
      <ul>
        <li><strong>Target Market:</strong> 65 million Indian SMEs (10-250 employees)</li>
        <li><strong>Year 5 Revenue:</strong> ₹120 Crores</li>
        <li><strong>Core Product:</strong> AI-powered business automation platform with 9 modules</li>
        <li><strong>Key Features:</strong> 80-90% cheaper than Zoho/SAP, 90-day implementation, Philosophy-driven AI</li>
      </ul>

      <h3 style="color: #00a8cc;">2. Sakshi (Conscious Living Ecosystem) - B2C Wellness</h3>
      <ul>
        <li><strong>Target Market:</strong> Urban middle-class consumers (25-45 years, ₹10-30L income)</li>
        <li><strong>Year 5 Revenue:</strong> ₹48 Crores</li>
        <li><strong>Core Product:</strong> 7 integrated centers (Cafe, Oasis, Meditation, Learning, Marketplace, Community, Events)</li>
        <li><strong>Key Features:</strong> 400x cost efficiency vs Dubai Museum, Triple pricing, VR meditation</li>
      </ul>

      <h3 style="color: #00a8cc;">3. SubCircle (Underground Culture & Thrift) - B2C Culture</h3>
      <ul>
        <li><strong>Target Market:</strong> 18-35 year old urban creatives</li>
        <li><strong>Year 5 Revenue:</strong> ₹6 Crores</li>
        <li><strong>Core Product:</strong> Curated thrift marketplace + cultural events + creator community</li>
        <li><strong>Key Features:</strong> Story-driven fashion, Quarterly events, 65-72% cost savings via white-label</li>
      </ul>

      <h2 style="color: #0066cc; margin-top: 30px;">Financial Highlights (Year 5)</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="background-color: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Metric</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Value</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">Total Revenue</td>
          <td style="border: 1px solid #ddd; padding: 10px;">₹174 Crores</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="border: 1px solid #ddd; padding: 10px;">EBITDA</td>
          <td style="border: 1px solid #ddd; padding: 10px;">₹59.7 Crores (34% margin)</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">Net Profit</td>
          <td style="border: 1px solid #ddd; padding: 10px;">₹43.5 Crores (25% margin)</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="border: 1px solid #ddd; padding: 10px;">Headcount</td>
          <td style="border: 1px solid #ddd; padding: 10px;">1,180 People</td>
        </tr>
      </table>

      <h2 style="color: #0066cc; margin-top: 30px;">Seed Round Investment</h2>
      <ul>
        <li><strong>Investment Ask:</strong> ₹10.55 Crores</li>
        <li><strong>Equity Offered:</strong> 20.9%</li>
        <li><strong>Pre-Money Valuation:</strong> ₹40 Crores</li>
        <li><strong>Expected Returns (Year 5):</strong> 17-35x</li>
        <li><strong>IRR:</strong> 76-106%</li>
      </ul>

      <h2 style="color: #0066cc; margin-top: 30px;">Strategic Advantages</h2>
      <ul>
        <li><strong>Unified Seva Token System:</strong> Proprietary impact measurement currency across B2B and B2C</li>
        <li><strong>Philosophy-Driven AI:</strong> Management wisdom combined with ESG tracking</li>
        <li><strong>400x Cost Efficiency:</strong> Sakshi vs Dubai Museum wellness floor</li>
        <li><strong>White-Label Leverage:</strong> SubCircle saves 65-72% via Sakshi codebase</li>
        <li><strong>Cross-Selling Synergies:</strong> 15-20% of customers expected to use multiple divisions</li>
        <li><strong>Measurable Impact:</strong> Data-driven proof of social, environmental, and economic outcomes</li>
      </ul>

      <h2 style="color: #0066cc; margin-top: 30px;">Technical Foundation</h2>
      <ul>
        <li><strong>Documentation:</strong> 177,000+ words across 20+ documents</li>
        <li><strong>Database Tables:</strong> 53 tables designed (AVE: 41, SubCircle: 12)</li>
        <li><strong>API Endpoints:</strong> 35+ REST APIs specified</li>
        <li><strong>ML/AI Models:</strong> 6 models for AVE modules</li>
        <li><strong>LLM Infrastructure:</strong> RTX 4090 Cloud (94.5% cost reduction)</li>
      </ul>

      <h2 style="color: #0066cc; margin-top: 30px;">Market Opportunity</h2>
      <ul>
        <li><strong>Total Addressable Market:</strong> ₹5.2L Crores</li>
        <li><strong>AVE TAM:</strong> ₹4,68,000 Crores (65M SMEs)</li>
        <li><strong>Sakshi TAM:</strong> ₹50,000 Crores (500M urban consumers)</li>
        <li><strong>SubCircle TAM:</strong> ₹2,000 Crores (50M urban creatives)</li>
      </ul>

      <hr style="margin-top: 40px; border: none; border-top: 2px solid #0066cc;">
      <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
        This document is a comprehensive summary of AANS research materials.<br/>
        For complete details, visit the AANS Research Summary website.
      </p>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: 'AANS-Research-Summary.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' },
  };

  html2pdf().set(opt).from(content).save();
};
