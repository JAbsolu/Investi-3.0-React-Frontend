import { teal } from "@mui/material/colors";

// Dashboard/dark theme colors
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const sidebarBg = darkGradient;
const sidebarBorder = '#18191a';
const mainBg = "#121212";

const spinKeyframes = `
@keyframes dashboard-spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
`;

const DashboardSkeleton = () => {
    return (
      <>
        <style>{spinKeyframes}</style>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          background: mainBg,
          gap: 0
        }}>
          {/* Main content skeleton */}
          <div style={{
            height: "100vh",
            width: "100%",
            flex: 1,
            background: darkGradient,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "3em 0",
            overflow: "auto"
          }}>

            <div style={{
              width: "98%",
              height: "100vh",
              background: "transparent",
              borderRadius: "14px",
              marginBottom: "2em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div className="loading-wrapper" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div
                  style={{
                    height: 80,
                    width: 80,
                    border: `4px solid ${teal[500]}`,
                    borderTop: `4px solid transparent`,
                    borderRadius: "50%",
                    animation: "dashboard-spin 1s linear infinite"
                  }}
                ></div>
                <p className="text-white mt-6" style={{color: "white", marginTop: 24}}>Loading...</p>
              </div>
            </div>
          </div>
      </div>
      </>
    );
}

export default DashboardSkeleton;