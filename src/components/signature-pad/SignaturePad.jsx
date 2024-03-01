import SignatureCanvas from "react-signature-canvas";
import "./SignaturPad.css";
import { useState, useEffect } from "react";

const SignaturePad = () => {
  const [signature, setSignature] = useState();
  const [signatureUrl, setSignatureUrl] = useState();

  useEffect(() => {
    const handleContextmenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  function handleSignatureSave() {
    setSignatureUrl(signature.getTrimmedCanvas().toDataURL("image/png"));
  }
  function handleSignatureClear() {
    signature.clear();
    setSignature(null);
    setSignatureUrl(null);
  }

  return (
    <>
      <div className="signature-pad-wrapper">
        <SignatureCanvas
          minWidth={2}
          clearOnResize={false}
          canvasProps={{
            className: "signature-canvas",
          }}
          ref={(data) => setSignature(data)}
        />
      </div>
      <div className="actions-container">
        <button onClick={handleSignatureSave}>Save Signature</button>
        <button onClick={handleSignatureClear}>Clear Signature</button>
        {signatureUrl && (
          <a href={signatureUrl} download={"My-Signatur.png"}>
            Download
          </a>
        )}
      </div>
    </>
  );
};

export default SignaturePad;
