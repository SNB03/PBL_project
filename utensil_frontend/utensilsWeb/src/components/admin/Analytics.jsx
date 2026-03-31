import React from 'react';

const Analytics = () => {
  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-header">
        <h2>Business Analytics & Trends</h2>
        <p>Track revenue and get predictive insights.</p>
      </div>

      <div className="analytics-layout">
        <div className="analytics-left">

          <div className="analytics-card">
            <h3>Revenue Trend (Last 6 Months)</h3>
            <div className="css-bar-chart">
              <div className="bar-wrapper"><div className="bar" style={{height: '40%'}}></div><span>Oct</span></div>
              <div className="bar-wrapper"><div className="bar" style={{height: '60%'}}></div><span>Nov</span></div>
              <div className="bar-wrapper"><div className="bar" style={{height: '90%', backgroundColor: '#10b981'}}></div><span>Dec</span></div>
              <div className="bar-wrapper"><div className="bar" style={{height: '50%'}}></div><span>Jan</span></div>
              <div className="bar-wrapper"><div className="bar" style={{height: '70%'}}></div><span>Feb</span></div>
              <div className="bar-wrapper"><div className="bar" style={{height: '85%'}}></div><span>Mar</span></div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Top Selling Products (This Month)</h3>
            <table className="simple-table">
              <tbody>
                <tr><td>1. Non-Stick Tawa (28cm)</td><td className="text-right font-bold">42 Units</td></tr>
                <tr><td>2. Prestige Cooker (3L)</td><td className="text-right font-bold">18 Units</td></tr>
                <tr><td>3. Professional Chef Knife</td><td className="text-right font-bold">15 Units</td></tr>
              </tbody>
            </table>
          </div>

        </div>

        <div className="analytics-right">
          <div className="insight-box predictive">
            <div className="insight-icon">🔮</div>
            <div>
              <h4>Seasonal Demand Prediction</h4>
              <p>Historically, sales for <strong>Glass Jugs</strong> spike by 300% in April due to summer heat. <br/><em>Action: Restock Serveware before April 1st.</em></p>
            </div>
          </div>
          <div className="insight-box warning">
            <div className="insight-icon">📉</div>
            <div>
              <h4>Declining Trend Alert</h4>
              <p><strong>Iron Kadais</strong> have seen a 40% drop in sales over the last 30 days. <br/><em>Action: Consider running a discount campaign.</em></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;