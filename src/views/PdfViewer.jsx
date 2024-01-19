import { pdfjs } from "react-pdf";
import { Worker, Viewer } from "@react-pdf-viewer/core";

const PDFViewer = () => {
  return (
    <Worker
      workerUrl={`//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}
    >
      <Viewer fileUrl={"/pdf/ACH"}></Viewer>
    </Worker>
  );
};

export default PDFViewer;
