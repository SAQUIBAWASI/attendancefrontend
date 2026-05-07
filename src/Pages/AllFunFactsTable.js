import React, { useEffect, useState } from 'react';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const API = 'http://31.97.206.144:6098/api/admin';

const AllFunFactsTable = () => {
  const [facts, setFacts] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const itemsPerPage = 10;

  const fetchFunFacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/getallfunfacts`);
      if (res.data?.funFacts) {
        setFacts(res.data.funFacts);
      }
    } catch (err) {
      setError('Failed to fetch fun facts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunFacts();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this fun fact?");
    if (!confirm) return;
    try {
      await axios.delete(`${API}/delete-funfact/${id}`);
      setFacts((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert('Failed to delete fun fact.');
    }
  };

  const filtered = facts.filter((fact) =>
    fact.fact.toLowerCase().includes(search.toLowerCase()) ||
    fact.source.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  const exportData = (type) => {
    const dataToExport = filtered.slice(0, exportLimit).map((f) => ({
      fact: f.fact,
      source: f.source,
      pubDate: f.pubDate,
      link: f.link
    }));
    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'FunFacts');
    writeFile(wb, `funfacts.${type}`);
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-purple-800">All Fun Facts</h1>

      <div className="flex justify-between mb-4">
        <input
          placeholder="Search fact or source..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-1/3"
        />
        <div className="flex items-center gap-2">
          <select
            className="border p-2 rounded"
            value={exportLimit}
            onChange={(e) => setExportLimit(Number(e.target.value))}
          >
            <option>10</option>
            <option>50</option>
            <option>100</option>
            <option>500</option>
          </select>
          <button onClick={() => exportData('csv')} className="bg-gray-200 px-3 py-1 rounded">
            CSV
          </button>
          <button onClick={() => exportData('xlsx')} className="bg-gray-200 px-3 py-1 rounded">
            Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading fun facts...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <table className="w-full border-collapse border text-sm mb-4">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Fact</th>
                <th className="border p-2">Source</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">No fun facts found</td>
                </tr>
              ) : (
                pageItems.map((f, idx) => (
                  <tr key={f._id} className="odd:bg-white even:bg-gray-100">
                    <td className="border p-2">{start + idx + 1}</td>
                    <td className="border p-2">{f.fact}</td>
                    <td className="border p-2">{f.source}</td>
                    <td className="border p-2">{new Date(f.pubDate).toLocaleDateString()}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDelete(f._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllFunFactsTable;
