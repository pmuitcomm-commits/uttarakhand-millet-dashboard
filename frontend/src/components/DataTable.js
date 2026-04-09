import { useState } from "react";

function DataTable({ data, title = "📋 Detailed Data" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100;
  
  const columns = data?.length > 0 ? Object.keys(data[0]) : [];
  const totalPages = Math.ceil((data?.length || 0) / recordsPerPage);
  
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = data?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-container" data-aos="fade-up">
      <div className="table-header">
        <h2>{title}</h2>
        {totalPages > 1 && (
          <div className="pagination-info">
            Showing {startIndex + 1} - {Math.min(endIndex, data.length)} of {data.length}
          </div>
        )}
      </div>
      {data?.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={`${index}-${column}`}>{row[column] ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
              >
                First
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={currentPage === pageNum ? "active" : ""}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          )}
        </>
      ) : (
        <p>No records available.</p>
      )}
    </div>
  );
}

export default DataTable;