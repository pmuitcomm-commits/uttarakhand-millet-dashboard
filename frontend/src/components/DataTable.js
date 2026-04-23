import { useState } from "react";

const tableButtonBase =
  "rounded-md border border-[#024b37] bg-[#024b37] px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#035344] hover:shadow-[0_2px_8px_rgba(2,75,55,0.2)] disabled:cursor-not-allowed disabled:border-[#d0d0d0] disabled:bg-[#d0d0d0] disabled:text-[#999999] disabled:shadow-none disabled:transform-none max-[480px]:px-2.5 max-[480px]:py-1.5 max-[480px]:text-xs dark:border-[#024b37] dark:bg-[#024b37] dark:text-white dark:hover:bg-[#035344] dark:hover:shadow-[0_2px_8px_rgba(2,75,55,0.4)] dark:disabled:border-[#444444] dark:disabled:bg-[#444444] dark:disabled:text-[#999999]";

function pageButtonClassName(active) {
  return active
    ? `${tableButtonBase} !border-[#0a7c59] !bg-[#0a7c59] !font-bold`
    : tableButtonBase;
}

function DataTable({ data, title = "Detailed Data", recordsPerPage = 100 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const safeRecordsPerPage =
    Number.isFinite(recordsPerPage) && recordsPerPage > 0
      ? recordsPerPage
      : Math.max(data?.length || 0, 1);
  const columns = data?.length > 0 ? Object.keys(data[0]) : [];
  const totalPages = Math.max(Math.ceil((data?.length || 0) / safeRecordsPerPage), 1);

  const startIndex = (currentPage - 1) * safeRecordsPerPage;
  const endIndex = startIndex + safeRecordsPerPage;
  const currentData =
    safeRecordsPerPage >= (data?.length || 0) ? data || [] : data?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div
      className="!block !transform-none !overflow-x-auto !visible w-full rounded-lg !opacity-100"
      data-aos="fade-up"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 break-words text-[1.2rem] font-bold text-[#024b37] max-[480px]:text-base dark:text-white">{title}</h2>
        {totalPages > 1 && (
          <div className="text-sm font-medium text-[#666666] dark:text-[#cccccc]">
            Showing {startIndex + 1} - {Math.min(endIndex, data.length)} of {data.length}
          </div>
        )}
      </div>
      {data?.length > 0 ? (
        <>
          <table className="min-w-[760px] w-full border-collapse bg-white dark:bg-[#2a2a2a]">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap border border-[#e2e8f0] bg-[#f5f5f5] px-4 py-3 text-left text-[0.85rem] font-bold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr
                  key={index}
                  className="even:bg-[#f5f8fa] hover:bg-[#f9fbff] dark:even:bg-[#252525] dark:hover:bg-[#333333]"
                >
                  {columns.map((column) => (
                    <td
                      className="whitespace-nowrap border border-[#e2e8f0] px-4 py-3 text-left text-[0.95rem] text-[#024b37] dark:border-[#444444] dark:text-white"
                      key={`${index}-${column}`}
                    >
                      {row[column] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 p-4 max-[480px]:px-0">
              <button 
                className={tableButtonBase}
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
              >
                First
              </button>
              <button 
                className={tableButtonBase}
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="mx-2 flex gap-1 max-[480px]:mx-0">
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
                      className={`${pageButtonClassName(currentPage === pageNum)} min-w-9 px-2.5 py-1.5 text-[0.85rem]`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className={tableButtonBase}
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button 
                className={tableButtonBase}
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
