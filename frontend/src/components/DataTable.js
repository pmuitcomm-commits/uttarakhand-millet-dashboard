function DataTable({ data, title = "📋 Detailed Data" }) {
  const columns = data?.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="table-container" data-aos="fade-up">
      <h2>{title}</h2>
      {data?.length > 0 ? (
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={`${index}-${column}`}>{row[column] ?? "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No records available.</p>
      )}
    </div>
  );
}

export default DataTable;