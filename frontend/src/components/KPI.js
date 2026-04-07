function KPI({ data }) {
  return (
    <div className="kpi-container">
      <div className="kpi-card" data-aos="zoom-in" data-aos-delay="100">
        <h3>{data.total_production || 0}</h3>
        <p>Total Production (Tons)</p>
      </div>

      <div className="kpi-card" data-aos="zoom-in" data-aos-delay="200">
        <h3>{data.total_districts || 0}</h3>
        <p>Total Districts</p>
      </div>

      <div className="kpi-card" data-aos="zoom-in" data-aos-delay="300">
        <h3>{data.total_millets || 0}</h3>
        <p>Millet Types</p>
      </div>

      <div className="kpi-card" data-aos="zoom-in" data-aos-delay="400">
        <h3>{data.total_records || 0}</h3>
        <p>Total Records</p>
      </div>
    </div>
  );
}

export default KPI;