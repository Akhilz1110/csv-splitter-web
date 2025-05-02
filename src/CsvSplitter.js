import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const CsvSplitter = () => {
  const [file, setFile] = useState(null);
  const [splitSize] = useState(100000);
  const [chunks, setChunks] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isFileSelected, setIsFileSelected] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsFileSelected(true);

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const rows = text.trim().split("\n");
      const header = rows[0];
      const data = rows.slice(1);

      setTotalRows(data.length);

      const chunked = [];
      for (let i = 0; i < data.length; i += Number(splitSize)) {
        const chunk = [header, ...data.slice(i, i + Number(splitSize))].join("\n");
        chunked.push(chunk);
      }

      setChunks(chunked);
    };
    reader.readAsText(selectedFile);
  };

  const downloadZip = () => {
    const zip = new JSZip();

    chunks.forEach((chunk, index) => {
      zip.file(`split_${index + 1}.csv`, chunk);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "csv_splitter_file.zip");
    });
  };

  return (
    <div
      className={`splitter-container ${isFileSelected ? "no-rotate" : ""}`}
      style={{
        marginLeft: "50px",
        marginTop: "40px",
        maxWidth: "300px",
        textAlign: "start",
      }}
    >
      <h2 className="title">CSV Splitter</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="file-input"
      />

      {chunks.length > 0 && (
        <div className="result-box">
          <p>Total number of rows: {totalRows}</p>
          <p>
            CSV will be split into {chunks.length} files (Row limit per file: {splitSize})
          </p>
          <button className="download-button" onClick={downloadZip}>
            Download ZIP
          </button>
        </div>
      )}
    </div>
  );
};

export default CsvSplitter;
