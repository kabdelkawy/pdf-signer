import { pdfjs, Document, Page } from "react-pdf";
import "./App.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState } from "react";

const PDFRenderer = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [doubleClickPoints, setDoubleClickPoints] = useState([0, 0]);

  function onDocumentLoadSuccess(pdf) {
    setTotalPages(pdf.numPages);
  }

  function handleDoubleClick(event) {
    const localX = event.clientX - event.currentTarget.offsetLeft;
    const localY = event.clientY - event.currentTarget.offsetTop;
    setDoubleClickPoints([localX, localY]);
    console.log(doubleClickPoints);
  }

  return (
    <section className="content-wrapper">
      <section className="sidebar-wrapper"></section>
      <Document file="./pdf/lenovo" onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          size="A4"
          pageNumber={currentPage}
          renderTextLayer={false}
          onDoubleClick={handleDoubleClick}
        ></Page>
      </Document>
    </section>
  );
};

export default PDFRenderer;
