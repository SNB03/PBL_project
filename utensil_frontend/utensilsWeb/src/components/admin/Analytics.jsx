// src/components/admin/Analytics.jsx
import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Real Data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('http://localhost:8080/api/orders'),
          fetch('http://localhost:8080/api/products?size=500')
        ]);

        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (productsRes.ok) {
          const pData = await productsRes.json();
          setProducts(pData.content || pData);
        }
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Crunching numbers...</div>;
  }

  // ==========================================
  // DATA CRUNCHING: REVENUE TREND (Last 6 Months)
  // ==========================================
  const monthlyRevenue = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize the last 6 months with 0
  const d = new Date();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const targetMonth = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const label = monthNames[targetMonth.getMonth()];
    last6Months.push(label);
    monthlyRevenue[label] = 0;
  }

  // Tally up completed/delivered orders
  orders.forEach(order => {
    if (['COMPLETED', 'DELIVERED'].includes(order.status)) {
      const orderDate = new Date(order.orderDate);
      const label = monthNames[orderDate.getMonth()];
      if (monthlyRevenue[label] !== undefined) {
        monthlyRevenue[label] += order.total;
      }
    }
  });

  // Calculate highest month to scale the CSS bars dynamically
  const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1); // Avoid divide by zero

  // ==========================================
  // DATA CRUNCHING: TOP SELLING PRODUCTS
  // ==========================================
  const productSales = {};
  orders.forEach(order => {
    if (['COMPLETED', 'DELIVERED'].includes(order.status)) {
      order.itemsList.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = 0;
        productSales[item.name] += item.qty;
      });
    }
  });

  // Sort descending by quantity
  const topSellers = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Get top 5

  // ==========================================
  // DATA CRUNCHING: SMART INSIGHTS
  // ==========================================
  const currentMonth = new Date().getMonth();
  const isSummerFestive = currentMonth >= 2 && currentMonth <= 5; // March to June

  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockItems = products.filter(p => p.stock === 0);

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-header">
        <h2>Business Analytics & Trends</h2>
        <p>Real-time revenue tracking and predictive insights.</p>
      </div>

      <div className="analytics-layout">
        <div className="analytics-left">

          {/* DYNAMIC REVENUE BAR CHART */}
          <div className="analytics-card">
            <h3>Revenue Trend (Last 6 Months)</h3>
            <div className="css-bar-chart">
              {last6Months.map((monthLabel, index) => {
                const revenue = monthlyRevenue[monthLabel];
                // Calculate height percentage (min 5% so the bar is at least visible)
                const heightPct = Math.max((revenue / maxRevenue) * 100, 5);
                const isCurrentMonth = index === 5; // Last item is current month

                return (
                  <div key={monthLabel} className="bar-wrapper" title={`₹${revenue.toLocaleString()}`}>
                    <div
                      className="bar"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: isCurrentMonth ? '#10b981' : '#3b82f6',
                        transition: 'height 1s ease-out'
                      }}
                    ></div>
                    <span>{monthLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC TOP SELLERS TABLE */}
          <div className="analytics-card">
            <h3>Top Selling Products (All Time)</h3>
            {topSellers.length > 0 ? (
              <table className="simple-table">
                <tbody>
                  {topSellers.map(([name, qty], index) => (
                    <tr key={name}>
                      <td>{index + 1}. {name}</td>
                      <td className="text-right font-bold">{qty} Units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#64748b' }}>Not enough sales data yet.</p>
            )}
          </div>

        </div>

        <div className="analytics-right">

          {/* SMART FSDP INSIGHT */}
          <div className="insight-box predictive">
            <div className="insight-icon">🔮</div>
            <div>
              <h4>Seasonal Demand Prediction</h4>
              <p>
                {isSummerFestive
                  ? "Historically, sales for Serveware and Jugs spike during the summer months. Action: Prioritize restocking hydration products."
                  : "We are entering the winter/festive season. Expect high demand for premium gifting cookware and larger pressure cookers."}
              </p>
            </div>
          </div>

          {/* DYNAMIC INVENTORY WARNING */}
          {outOfStockItems.length > 0 ? (
            <div className="insight-box warning" style={{ borderTopColor: '#ef4444' }}>
              <div className="insight-icon">🚨</div>
              <div>
                <h4>Revenue Loss Alert</h4>
                <p><strong>{outOfStockItems.length} products</strong> are currently out of stock. You are missing out on potential sales. <br/><em>Action: Immediate restock required.</em></p>
              </div>
            </div>
          ) : lowStockItems.length > 0 ? (
             <div className="insight-box warning">
              <div className="insight-icon">📉</div>
              <div>
                <h4>Inventory Depletion Alert</h4>
                <p><strong>{lowStockItems.length} products</strong> are running critically low on stock (Under 5 units). <br/><em>Action: Contact suppliers soon.</em></p>
              </div>
            </div>
          ) : (
             <div className="insight-box" style={{ borderTopColor: '#10b981' }}>
              <div className="insight-icon">✅</div>
              <div>
                <h4>Healthy Inventory</h4>
                <p>All active products have healthy stock levels. No immediate restocking actions required.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Analytics;