import React from "react";

export const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="error-container">
      <h2>Error Loading 3D Viewer</h2>
      <p>{error.message}</p>
      <details style={{ whiteSpace: "pre-wrap" }}>
        {error.stack}
      </details>
    </div>
  );
};
