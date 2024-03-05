import { useState, useRef, useEffect } from "react";
import { pdfjs } from "react-pdf";
import "./PdfViewer.scss";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const viewScale = 1.5;
  const rectWidth = 250 * viewScale;
  const rectHeight = 28 * viewScale;

  const canvasRef = useRef(null);
  const inputFileRef = useRef(null);

  const [pdf, setPdf] = useState();
  const [numPages, setNumPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [drawnRects, setDrawnRects] = useState([]);
  const [signCountList, setSignCountList] = useState([]);

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
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;
    drawRects();
  }

  function drawRects() {
    if (drawnRects) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      drawnRects.forEach((rect, index) => {
        if (currentPage === rect.signPage) {
          const x = rect.positionX;
          const y = rect.positionY;
          ctx.fillStyle = "gray";
          ctx.fillRect(x, y, rectWidth, rectHeight);
          ctx.font = `${12.5 * viewScale}px Arial`;
          ctx.fillStyle = "white";
          const textX = x + rectWidth / 3.5;
          const textY = y + rectHeight / 1.5;
          ctx.fillText(`Signature ${index + 1} Required`, textX, textY);
        }
      });
    }
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
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const x = cx - rectWidth / 2;
      const y = cy - rectHeight / 2;
      setDrawnRects([
        ...drawnRects,
        {
          positionX: x,
          positionY: y,
          signPage: currentPage,
        },
      ]);
    }
  }

  useEffect(() => {
    if (drawnRects.length !== 0) {
      const reducedList = drawnRects.reduce((accumulator, current) => {
        const existingItemIndex = accumulator.findIndex(
          (item) => item.pageNumber === current.signPage
        );
        if (existingItemIndex !== -1) accumulator[existingItemIndex].count++;
        else accumulator.push({ pageNumber: current.signPage, count: 1 });
      }, []);
      console.log(reducedList);
      setSignCountList(reducedList);
    }
  }, [drawnRects]);

  return (
    <section className="viewer-section">
      <h1>Precision Accounting International</h1>
      <h3>Tax Return signature</h3>
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
      <div className="viewer-wrapper">
        <div className="canvas-wrapper">
          {pdf && <canvas ref={canvasRef} onDoubleClick={handleDoubleClick} />}
        </div>
        <div className="rect-list-wrapper">
          {signCountList && (
            <div className="rect-list">
              {signCountList.map((sign, index) => (
                <div className="rect-item-wrapper" key={index}>
                  <p>
                    {sign.count} Required Signatures at Page {sign.pageNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PDFViewer;
