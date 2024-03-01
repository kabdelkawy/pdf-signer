import { useState, useRef, useEffect } from "react";
import { pdfjs } from "react-pdf";
import "./PdfViewer.scss";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const viewScale = 2;

  const canvasRef = useRef(null);
  const inputFileRef = useRef(null);

  const [pdf, setPdf] = useState();
  const [numPages, setNumPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pdf) {
      loadPage();
    }
  });

  function loadPDF(event) {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const pdfDataUrl = reader.result;
      const response = await fetch(pdfDataUrl);
      const pdfData = await response.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      setPdf(pdf);
      setNumPages(pdf.numPages);
    };
    reader.readAsDataURL(selectedFile);
  }

  async function loadPage() {
    const page = await pdf.getPage(currentPage);
    const viewport = page.getViewport({ scale: viewScale });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.style.border = "1px solid black";
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  }

  function nextPage() {
    currentPage < numPages && setCurrentPage(currentPage + 1);
  }

  function prevPage() {
    currentPage > 1 && setCurrentPage(currentPage - 1);
  }

  function firstPage() {
    setCurrentPage(1);
  }

  function lastPage() {
    setCurrentPage(numPages);
  }

  function handleUploadFile() {
    inputFileRef.current.click();
  }

  function handleDoubleClick(e) {
    if (pdf) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const rectWidth = 250 * viewScale;
      const rectHeight = 25 * viewScale;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.fillStyle = "gray";
      ctx.fillRect(x, y, rectWidth, rectHeight);
      ctx.font = "25px Arial";
      ctx.fillStyle = "white";
      const textX = x + rectWidth / 3.5;
      const textY = y + rectHeight / 1.5;
      ctx.fillText("Signature Required", textX, textY);
    }
  }

  return (
    <section>
      <div>
        <input
          type="file"
          onChange={loadPDF}
          style={{ display: "none" }}
          ref={inputFileRef}
        />
      </div>
      <div className="viewer-control-wrapper">
        <button onClick={handleUploadFile}>Upload</button>
        <button onClick={firstPage}>&lt;&lt;</button>
        <button onClick={prevPage}>&lt;</button>
        {numPages && (
          <span>
            {currentPage} of {numPages}
          </span>
        )}
        <button onClick={nextPage}>&gt;</button>
        <button onClick={lastPage}>&gt;&gt;</button>
        <button>Save</button>
      </div>
      <div className="canvas-wrapper">
        {pdf && <canvas ref={canvasRef} onDoubleClick={handleDoubleClick} />}
      </div>
    </section>
  );
};

export default PDFViewer;
